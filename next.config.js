
module.exports = {
  api: { bodyParser: { sizeLimit: '500mb' }, responseLimit: false },
  experimental: { serverComponentsExternalPackages: ['fluent-ffmpeg','ffmpeg-static'] }
}
