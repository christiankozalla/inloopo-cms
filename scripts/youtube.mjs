import google from '@googleapis/youtube';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GCP_YOUTUBE_DATA_API_KEY
});

export { youtube }
