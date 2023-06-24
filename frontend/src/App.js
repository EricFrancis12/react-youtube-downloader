import { useState, useRef } from 'react';
import { removeNonStandardChars, formatDate } from './assets/js/utils';
import loadingGif from './assets/img/loading.gif';
import Form1 from './components/Form1';



function App() {

  const [viewport, setViewport] = useState('form-1');
  const [download, setDownload] = useState('form-2');
  const [formats, setFormats] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState({});
  const [videoData, setVideoData] = useState({ title: '', channelName: '', duration: '', views: '', thumbnailUrl: '' });
  const [blob, setBlob] = useState(null);
  const [fileExt, setFileExt] = useState('');

  const ytURL_Ref = useRef();

  const timestamp = Date.now();
  const fileName = removeNonStandardChars(videoData.title) + '-Downloaded-From-YOUR-APP-NAME-' + formatDate(timestamp) + '-' + timestamp;

  let blobUrl;
  blob ? blobUrl = URL.createObjectURL(blob) : blobUrl = null;



  async function submitForm1(e) {
    e.preventDefault();

    // check if ytURL_Ref is a valid YouTube URL or video ID; return if both are false.

    setViewport('loading');
    const res = await fetch('/info', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        input: ytURL_Ref.current.value
      })
    });

    if (res.ok) {
      const resJSON = await res.json();

      setViewport('form-2');
      setFormats(resJSON.formats);
      setSelectedFormat(resJSON.formats[0]);
      setVideoData(resJSON.videoData);
    }
  }

  async function submitForm2(e) {
    e.preventDefault();

    setDownload('loading');
    const res = await fetch('/download', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        v: selectedFormat.v,
        itag: selectedFormat.itag,
        mergeRequired: selectedFormat.mergeRequired
      })
    });
    console.log(res);

    if (res.ok) {
      const blob = await res.blob();

      setDownload('download');
      setBlob(blob);
    } else {
      const resJSON = await res.json();
      console.log(resJSON.message);
    }
  }

  return (
    <div className="App">
      <header className="navbar">

      </header>
      <div className="viewport">
        {viewport === 'loading' ? (
          <div>
            <img src={loadingGif}></img>
          </div>
        ) : ''}
        {viewport === 'form-1' ? (
          <form id="form-1">
            <h1>Download YouTube Videos For Free</h1>
            <p>The Simplest & Fastest YouTube Downloader On The Web</p>
            <input type="text" ref={ytURL_Ref} placeholder="Paste YouTube Link Here"></input>
            <button type="submit" onClick={e => submitForm1(e)}>Start</button>
          </form>
        ) : ''}
        {viewport === 'form-2' || viewport === 'download' ? (
          <form id="form-2">
            <div className="videoData">
              <div className="left">
                <img className="thumbnail" src={videoData.thumbnailUrl}></img>
              </div>
              <div className="middle">
                <p>Title: {videoData.title}</p>
                <p>Channel: {videoData.channelName}</p>
                <p>Duration: {videoData.duration}</p>
                <p>Views: {videoData.views}</p>
              </div>
              <div className="right">
                {download === 'form-2' ? (
                  <>
                    <select onChange={e => setSelectedFormat(JSON.parse(e.target.value))}>
                      {formats.map(format => {
                        return (<option value={JSON.stringify(format)}>{format.q} | {format.itag} | {format.mergeRequired.toString()}</option>);
                      })}
                    </select>
                    <button type="submit" onClick={e => submitForm2(e)}>Get Link</button>
                  </>
                ) : ''}
                {download === 'loading' ? (
                  <div>
                    <img src={loadingGif}></img>
                  </div>
                ) : ''}
                {download === 'download' ? (
                  <>
                    <select onChange={e => setFileExt(e.target.value)}>
                      <option value=".mp4">mp4</option>
                      <option value=".mov">mov</option>
                      <option value=".avi">avi</option>
                      <option value=".mkv">mkv</option>
                      <option value=".flv">flv</option>
                      <option value=".wmv">wmv</option>
                    </select>
                    <div>
                      <a id="download-link" download={fileName + fileExt} href={blobUrl}>Download</a>
                    </div>
                  </>
                ) : ''}
              </div>
            </div>
          </form>
        ) : ''}
      </div >
    </div>
  );
}

export default App;
