import axios from 'axios'
import { env } from '../config/env'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface YouTubeSearchResult {
  videoId: string
  title: string
  channelTitle: string
  publishedAt: string
  description: string
}

export interface YouTubeVideoDetails {
  videoId: string
  title: string
  channelTitle: string
  duration: number // seconds
  viewCount: number
}

interface YouTubeSearchItem {
  id: { videoId: string }
  snippet: {
    title: string
    channelTitle: string
    publishedAt: string
    description: string
  }
}

interface YouTubeVideoItem {
  id: string
  snippet: { title: string; channelTitle: string }
  contentDetails: { duration: string }
  statistics: { viewCount?: string }
}

// ─── Scoring helpers ─────────────────────────────────────────────────────────

/**
 * Terms that strongly indicate this is NOT an official trailer.
 */
const REJECT_TERMS = [
  'fan made',
  'fan-made',
  'fan trailer',
  'reaction',
  'review',
  'explained',
  'analysis',
  'breakdown',
  'scene',
  'clip',
  'compilation',
  'supercut',
  'vs',
  'parody',
  'spoof',
  'meme',
  'edit',
  'amv',
  'tribute',
  'watchalong',
  'commentary',
  'spoiler',
  'behind the scenes',
  'making of',
  'interview',
  'featurette',
  'b-roll',
  'cast',
  'deleted scene',
]

/**
 * Channels that are highly trusted for official trailers.
 */
const TRUSTED_CHANNELS = [
  'movieclips trailers',
  'movieclips',
  'fandango movieclips',
  'warner bros. pictures',
  'universal pictures',
  'sony pictures entertainment',
  'paramount pictures',
  'walt disney studios',
  'marvel entertainment',
  'dc',
  '20th century studios',
  'lionsgate movies',
  'a24',
  'focus features',
  'searchlight pictures',
  'miramax',
  'mgm',
  'orion pictures',
  'neon',
]

/**
 * Parse ISO 8601 duration (PT1H2M3S) → total seconds.
 */
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)
  return hours * 3600 + minutes * 60 + seconds
}

/**
 * Score a candidate video to find the best official trailer.
 * Higher score = better candidate.
 */
function scoreCandidate(
  item: YouTubeSearchItem,
  details: YouTubeVideoItem,
  movieTitle: string,
  year: number
): number {
  const titleLower = item.snippet.title.toLowerCase()
  const channelLower = item.snippet.channelTitle.toLowerCase()
  const descLower = item.snippet.description.toLowerCase()
  const durationSecs = parseDuration(details.contentDetails.duration)
  const viewCount = parseInt(details.statistics.viewCount || '0', 10)

  let score = 0

  // ── Reject disqualifying content immediately ────────────────────────────────
  for (const term of REJECT_TERMS) {
    if (titleLower.includes(term)) return -9999
  }

  // ── Reward official trailer signals ────────────────────────────────────────
  if (titleLower.includes('official trailer')) score += 50
  else if (titleLower.includes('official')) score += 30
  else if (titleLower.includes('trailer')) score += 20

  if (titleLower.includes('teaser')) score -= 5 // prefer full trailers

  // ── Movie title match ──────────────────────────────────────────────────────
  const movieLower = movieTitle.toLowerCase()
  if (titleLower.includes(movieLower)) score += 40
  else if (descLower.includes(movieLower)) score += 10

  // ── Year match ────────────────────────────────────────────────────────────
  if (titleLower.includes(String(year)) || descLower.includes(String(year))) score += 15

  // ── Trusted channel ───────────────────────────────────────────────────────
  for (const ch of TRUSTED_CHANNELS) {
    if (channelLower.includes(ch)) {
      score += 60
      break
    }
  }

  // ── Duration guard: trailers are typically 60–240 seconds ─────────────────
  if (durationSecs >= 60 && durationSecs <= 240) score += 20
  else if (durationSecs > 0 && durationSecs < 60) score -= 30 // too short → teaser
  else if (durationSecs > 300) score -= 40 // too long → not a trailer

  // ── Popularity signal ─────────────────────────────────────────────────────
  if (viewCount > 5_000_000) score += 15
  else if (viewCount > 1_000_000) score += 8
  else if (viewCount > 100_000) score += 3

  return score
}

// ─── YouTube API client ───────────────────────────────────────────────────────

const ytApi = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
  timeout: 10_000,
})

/**
 * Search YouTube Data API v3 for candidate trailer videos.
 * Returns the raw search results sorted by relevance.
 *
 * IMPORTANT: Only call this during movie ingestion/admin operations,
 * never during live gameplay.
 */
async function searchYouTube(query: string): Promise<YouTubeSearchItem[]> {
  const response = await ytApi.get<{ items: YouTubeSearchItem[] }>('/search', {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      videoEmbeddable: 'true',
      videoCategoryId: '1', // Film & Animation
      maxResults: 10,
      key: env.youtubeApiKey,
    },
  })
  return response.data.items || []
}

/**
 * Fetch full video details (duration, stats) for a list of video IDs.
 */
async function getVideoDetails(videoIds: string[]): Promise<YouTubeVideoItem[]> {
  if (videoIds.length === 0) return []
  const response = await ytApi.get<{ items: YouTubeVideoItem[] }>('/videos', {
    params: {
      part: 'snippet,contentDetails,statistics',
      id: videoIds.join(','),
      key: env.youtubeApiKey,
    },
  })
  return response.data.items || []
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Find the best official movie trailer on YouTube.
 *
 * Search strategy:
 *   1. Run two queries: "<title> <year> official trailer" and
 *      "<title> <year> trailer" to maximise recall.
 *   2. Deduplicate candidate videos.
 *   3. Fetch full details (duration, stats) for all candidates.
 *   4. Score every candidate — rejects fan-made content immediately.
 *   5. Return the highest-scoring result, or null if nothing qualified.
 *
 * @param movieTitle - The movie's primary title
 * @param year       - Release year (improves query specificity)
 */
export async function searchMovieTrailer(
  movieTitle: string,
  year: number
): Promise<YouTubeVideoDetails | null> {
  if (!env.youtubeApiKey) {
    throw new Error('YOUTUBE_API_KEY is not configured')
  }

  const queries = [
    `"${movieTitle}" ${year} official trailer`,
    `${movieTitle} ${year} official trailer`,
  ]

  // Collect candidates from both queries, deduplicated by videoId
  const seen = new Set<string>()
  const candidates: YouTubeSearchItem[] = []

  for (const query of queries) {
    try {
      const results = await searchYouTube(query)
      for (const item of results) {
        if (!seen.has(item.id.videoId)) {
          seen.add(item.id.videoId)
          candidates.push(item)
        }
      }
    } catch (err) {
      console.warn(`[youtube] Search failed for query "${query}":`, err)
    }
  }

  if (candidates.length === 0) return null

  // Fetch full details for all candidates
  const videoIds = candidates.map(c => c.id.videoId)
  const details = await getVideoDetails(videoIds)
  const detailsMap = new Map(details.map(d => [d.id, d]))

  // Score and pick the best
  let bestScore = -Infinity
  let bestCandidate: YouTubeSearchItem | null = null
  let bestDetails: YouTubeVideoItem | null = null

  for (const candidate of candidates) {
    const detail = detailsMap.get(candidate.id.videoId)
    if (!detail) continue

    const score = scoreCandidate(candidate, detail, movieTitle, year)
    if (score > bestScore) {
      bestScore = score
      bestCandidate = candidate
      bestDetails = detail
    }
  }

  if (!bestCandidate || !bestDetails || bestScore < 0) return null

  return {
    videoId: bestCandidate.id.videoId,
    title: bestCandidate.snippet.title,
    channelTitle: bestCandidate.snippet.channelTitle,
    duration: parseDuration(bestDetails.contentDetails.duration),
    viewCount: parseInt(bestDetails.statistics.viewCount || '0', 10),
  }
}
