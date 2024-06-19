import jsonata from 'jsonata';
import React, {useState, useEffect} from 'react';

function Acquisition(){
    const API_KEY = "AIzaSyDblLjTx67PzOyjagi7kimhNGNEilKP6Eo";
    const PLAY_LIST_ID = "PLphVgbzLGFUT1krVX-1gqeXRmq5OSPt1D";
    const SHEET_ID = '1sivmuybNofhpBLm8PvX8aTm28MlYCQjCZwJBzLOsJtc';
    //const channelIds = ['UCgD0APk2x9uBlLM0UsmhQjw', 'UC1zjIMlGc1mkfGdzLAn7Zpw', 'UCdtRAcd3L_UpV4tMXCw63NQ']
    const playListURL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&status=&playlistId=${PLAY_LIST_ID}&key=${API_KEY}`;
    const spreadsheetsURL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?`;
    const videoURL = `https://www.googleapis.com/youtube/v3/videos?part=snippet&key=${API_KEY}`;
    const appsScriptUrl = "https://script.google.com/macros/s/AKfycbxBcwtZ9mzVIchPfWWO5ZpCX2VeBHkBZLsmuWIabZz7CiVMtU7ryJRNzkyDxuH-Jcnf/exec";
    const [youtubeList, setYoutubeList] = useState([]);
    const [db, setDB] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [isStop, setStop] = useState(false);
    const [updateList, setUpdateList] = useState([]);

    async function getPlayList(nextPageToken){
        const response = await fetch(`${playListURL}&pageToken=${nextPageToken ? nextPageToken : ''}`);
        const jsonData = await response.json();
        const data = [];

        if(jsonData.nextPageToken){
            data.push(...await getPlayList(jsonData.nextPageToken));
        }
        data.push(...jsonData.items)

        return data;
    }

    async function initDB(){
        const sheetName = '시트1';
        const query = encodeURIComponent('Select D');

        const response = await fetch(`${spreadsheetsURL}&sheet=${sheetName}&tq=${query}`);
        const data = await response.text();
        const parsed = JSON.parse(data.substring(47).slice(0, -2));
        const db = parsed.table;

        db.rows.forEach((element, rowIndex) => {
            const row = {};
            
            element.c.forEach((col, colIndex) => {
                row[db.cols[colIndex].label] = col.f ? col.f : col.v;
            });

            db.rows[rowIndex] = row;
        });

        return db;
    }

    async function getVideos(){
        const perPage = 50;
        const list = [];

        for (let i = 0; i < updateList.length; i += perPage) {
            let tempArray;
            tempArray = updateList.slice(i, i + perPage);
            list.push(tempArray);
        }

        list.forEach(async splitList => {
            const ids = splitList.map(element => element.snippet.resourceId.videoId).join(",");
            const response = await fetch(`${videoURL}&id=${ids}`);
            const jsonData = await response.json();
    
            jsonData.items.map(async video => {
                const id = video.id;
                const publishedAt = new Date(video.snippet.publishedAt).toISOString().slice(0, 10);
                const title = video.snippet.title;
                const description = video.snippet.description.replaceAll("/\r\n|\r|\n/", "\\n");
                //const contents = `${channelIds.find(id => id === video.snippet.channelId ? true : false) ? '공식 Youtube,' : ''}${video.snippet.channelTitle}`;
                const contents = `${video.snippet.channelTitle}`;
                
                try{
                    const response = await fetch(`${appsScriptUrl}?제목=${encodeURIComponent(title)}&설명=${encodeURIComponent(description)}&날짜=${publishedAt}&아이디=${id}&콘텐츠=${encodeURIComponent(contents)}`, {
                        redirect: "follow"
                    });
                    const jsonData = await response.json();
    
                    if(jsonData.result === "success"){
                        const youtube = await jsonata(`$[snippet.resourceId[videoId='${id}']]`).evaluate(youtubeList);
                        youtube.updateComplete = true;
    
                        setYoutubeList([...youtubeList]);
                    }
                }
                catch(e){
                    console.log(e);
                }
                
            });
        });
    }

    //데이터 로딩
    useEffect(() => {
        getPlayList().then(
            data => {
                setIsLoaded(true);
                setYoutubeList(data);
            },
            error => {
                setError(error);
                setIsLoaded(true);
            }
        );

        initDB().then(datas => {
            setDB([...datas.rows]);
        });
    }, []);

    //유튜브 플레이 리스트와 스프레드시트 비교하여 없는 영상 updateList변수에 추가
    useEffect(() => {
        if(youtubeList.length > 0 && db.length > 0 && !isStop){
            const list = [];

            setStop(true);
            
            /*db.map(async element => {
                const youtube = await jsonata(`$.snippet[resourceId[videoId='${element["아이디"]}']]`).evaluate(youtubeList);
                
                console.log(youtube);
            });*/
            youtubeList.map(async element => {
                const data = await jsonata(`$[아이디='${element.snippet.resourceId.videoId}']`).evaluate(db);
                
                if(data){
                    element.isExists = true;
                }
                else{
                    list.push(element);
                    setUpdateList([...list]);
                }
            });

            setYoutubeList([...youtubeList]);
        }
    }, [youtubeList, db, isStop]);

    //새로운 영상 스프레드시트로 업데이트
    useEffect(() => {
        if(updateList.length > 0){
            getVideos();
        }
    }, [updateList]);

    if(error){
        return <div>Error: {error.message}</div>;
    }
    else if(!isLoaded){
        return <div>Loading...</div>;
    }
    else{
        return(
            <ul>
                {youtubeList.map((element, index) => {
                    return (
                        <li key={element.id} style={{display: "block"}}>
                            <span style={{width: "50px", display: "inline-block"}}>{index + 1}</span>
                            <span style={{width: "50px", display: "inline-block"}}>{element.updateComplete ? "완료" : (element.isExists ? "O" : "X")}</span>
                            <span style={{display: "inline-block"}}>{element.snippet.title}</span>
                        </li>
                    )
                })}
            </ul>
        );
    }
}

export default Acquisition;