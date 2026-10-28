
import ytdl from '@distube/ytdl-core';
export default async function handler(req,res){
  const {url} = req.query;
  if(!url) return res.status(400).json({error:'url required'});
  try{
    const info = await ytdl.getInfo(url);
    res.json({
      title: info.videoDetails.title,
      duration: info.videoDetails.lengthSeconds,
      thumbnail: info.videoDetails.thumbnails.pop()?.url,
      author: info.videoDetails.author.name
    });
  }catch(e){ res.status(500).json({error:e.message}); }
}
