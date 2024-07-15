import React, {useState, useEffect} from 'react';
import jsonata from 'jsonata';
import SimpleBar from 'simplebar-react';
import './contents.css';
import 'simplebar-react/dist/simplebar.min.css';
import topQ from '../images/q.png';
import topW from '../images/w.png';
import topE from '../images/e.png';
import topR from '../images/r.png';

function Contents(){
    const topImages = [topQ, topW, topE, topR];

    function TagSelector(props) {
        const toggleEvent = function() {
            props.onDataChange({tagName: props.name, active: !props.active, activeName: props.activeName});
        };
    
        return (
            <li>
                <span className={"tag-item " + (props.active ? props.activeName : "")} onClick={() => toggleEvent()}>{props.name}</span>
            </li>
        );
    }

    function TagContainer(props) {
        const handleDataChange = function(tag) {
            props.onDataChange(tag);
        };

        const keys = Object.keys(props.data);
        const tags = keys.map((key, index) => {
            return (
                <TagSelector key={index} name={key} activeName={props.activeName} active={props.data[key].active === true} onDataChange={handleDataChange} />
            );
        });

        return (
            <SimpleBar>
                <ul className="tag-grid">
                    {tags}
                </ul>
            </SimpleBar>
        );
    }

    function SelectedTagContainer(props) {
        const handleDataChange = function(tag) {
            props.onDataChange(tag);
        };
        const tags = props.selectedTags.map((tag, index) => (<TagSelector key={index} name={tag.tagName} activeName={tag.activeName} active={true} onDataChange={handleDataChange} />));

        return (
            <SimpleBar>
                <ul>
                    {tags}
                </ul>
            </SimpleBar>
        );
    }

    function Contents(props) {
        const [selectedTags, setSelectedTags] = useState([]);
        const [order, setOrder] = useState(false);//false=newer, true=older
        const [page, setPage] = useState(1);
        const pagePerCount = 12;
        const handleDataChange = function(tag) {
            handleSelectedChange(tag);
            if(tag.activeName.indexOf("content") > -1) {
                handleContentsChange(tag);
            }
            else if(tag.activeName.indexOf("interval") > -1) {
                handleIntervalsChange(tag);
            }
            else if(tag.activeName.indexOf("character") > -1) {
                handleCharactersChange(tag);
            }
        }
        const handleSelectedChange = function(tag) {
            let tags = [...selectedTags];

            if(tag.active){
                tags.push(tag);
            }
            else{
                tags = tags.filter(_tag => _tag.tagName !== tag.tagName || _tag.activeName !== tag.activeName);
            }

            setPage(1);
            setSelectedTags([...tags]);
        };
        const handleContentsChange = function(tag) {
            props.contents[tag.tagName]["active"] = tag.active;
        };
        const handleIntervalsChange = function(tag) {
            props.intervals[tag.tagName]["active"] = tag.active;
        };
        const handleCharactersChange = function(tag) {
            props.characters[tag.tagName]["active"] = tag.active;
        };
        const [selectedContents, setSelectedContents] = useState(props.db.rows);
        const [viewList, setViewList] = useState([]);
        const [sortedList, setSortedList] = useState([]);

        //태그 선택
        useEffect(() => {
            let contentsNum = selectedTags.map(element => {
                let tags;

                if(element.activeName.includes("content")){
                    tags = props.contents;
                }
                else if(element.activeName.includes("interval")){
                    tags = props.intervals;
                }
                else if(element.activeName.includes("character")){
                    tags = props.characters;
                }
                
                return tags[element.tagName].contentsNum;
            });

            if(contentsNum.length > 0){
                const selectedContents = [];

                contentsNum = [].concat(...contentsNum);
    
                [...new Set(contentsNum)].forEach(element => {
                    selectedContents.push(props.db.rows[element]);
                });
    
                setSelectedContents([...selectedContents]);
            }
            else{
                setSelectedContents(props.db.rows);
            }
        }, [selectedTags, props.contents, props.intervals, props.characters, props.db.rows]);

        //선택된 콘텐츠 목록, 페이지 변경
        useEffect(() => {
            (async () => {
                const sortedList = await jsonata(`$^(${order ? '' : '>'}날짜)`).evaluate(selectedContents);
                
                if(sortedList){
                    setSortedList(Array.isArray(sortedList) ? [...sortedList] : [sortedList]);
                }
                else{
                    setViewList([]);
                }
            })();
        }, [selectedContents, order]);
        
        //정렬 처리된 콘텐츠 목록
        useEffect(() => {
            setViewList([...sortedList.slice(0, page * pagePerCount)]);
        }, [sortedList, page]);

        //스크롤 이벤트 등록
        useEffect(() => {
            const handleObserver = (entries => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setPage(prevPage => prevPage + 1);
                    }
                });
            });
            const observer = new IntersectionObserver(handleObserver, {
                threshold: 0,
            });
            const observerTarget = document.getElementById("observer");
            
            if (observerTarget) {
                observer.observe(observerTarget);
            }
        }, []);

        useEffect(() => {
            const handleObserver = (entries => {
                entries.forEach((entry) => {
                   if (entry.isIntersecting) {
                        document.querySelector(".content").classList.remove("scroll");
                    }
                    else{
                        document.querySelector(".content").classList.add("scroll");
                    }
                });
            });
            const observer = new IntersectionObserver(handleObserver, {
                threshold: 0,
            });
            const observerTarget = document.querySelector(".content-header");
            
            if (observerTarget) {
                observer.observe(observerTarget);
            }
        }, []);

        useEffect(() => {
            const handleObserver = (entries => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        document.querySelector(".content").classList.remove("show");
                    }
                });
            });
            const observer = new IntersectionObserver(handleObserver, {
                threshold: 0,
            });
            const observerTarget = document.querySelector(".head");
            
            if (observerTarget) {
                observer.observe(observerTarget);
            }
        }, []);

        return (
            <React.Fragment>
                <div className="content-header">
                    <div className="selected-container">
                        <div className="selected-wrapper">
                            <SelectedTagContainer selectedTags={selectedTags} onDataChange={handleDataChange} />
                        </div>
                    </div>
                    <div className="selection-container">
                        <div className="tag-container content-tag-container">
                            <div className="tag-header">콘텐츠</div>
                            <div className="tag-wrapper">
                                <TagContainer activeName="content-tag" selectedTags={selectedTags} data={props.contents} onDataChange={handleDataChange} />
                            </div>
                        </div>
                        <div className="tag-container interval-tag-container">
                            <div className="tag-header">기간</div>
                            <div className="tag-wrapper">
                                <TagContainer activeName="interval-tag" selectedTags={selectedTags} data={props.intervals} onDataChange={handleDataChange} />
                            </div>
                        </div>
                        <div className="tag-container character-tag-container">
                            <div className="tag-header">인물</div>
                            <div className="tag-wrapper">
                                <TagContainer activeName="character-tag" selectedTags={selectedTags} data={props.characters} onDataChange={handleDataChange} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tag-anchor">
                    <div onClick={e => {
                        if(document.querySelector(".content").classList.contains("show")){
                            document.querySelector(".content").classList.remove("show");
                        }
                        else{
                            document.querySelector(".content").classList.add("show");
                        }
                    }}>
                        <img src={topImages[Math.floor(Math.random() * 4)]} height="50" alt="검색창 열기" />
                    </div>
                </div>
                <div className="content-body">
                    <div className="content-container">
                        <div style={{textAlign: "right"}}>
                            <button className="order" onClick={async e => {
                                e.target.textContent = order ? '최신순' : '오래된순';
                                setPage(1);
                                setOrder(!order);
                            }}>최신순</button>
                        </div>
                        <div style={{marginTop: "14px"}}>
                            <ul>
                                {
                                    viewList.map(element => {
                                        return(
                                            <li key={element["아이디"]}>
                                                <div className="content-wrapper">
                                                    <div className="content-thumbnail" style={{background: `url(${"https://i.ytimg.com/vi/" + element["아이디"] + "/mqdefault.jpg"}) no-repeat center / contain`}}> 
                                                        <a href={"https://www.youtube.com/watch?v=" + element["아이디"]} target='_blank' rel="noreferrer noopener">{null}</a>
                                                    </div>
                                                    <div className="content-desc">
                                                        <div className="title-container">
                                                            <div className="title">{element["제목"]}</div>
                                                            <div className="more" onClick={e => {
                                                                document.querySelector("body").click();
                                                                e.currentTarget.closest("li").classList.add("detail");
                                                                e.stopPropagation();
                                                            }}>
                                                                <div className="dot"></div>
                                                            </div>
                                                        </div>
                                                        <div className="publishAt gap-top">
                                                            {new Date(element["날짜"]).toLocaleDateString("ko-KR",{
                                                                    year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                })
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="content-detail">
                                                    <SimpleBar>
                                                        <div style={{marginRight: "8px", whiteSpace: "pre-wrap"}}>{element["설명"]}</div>
                                                        <div className="gap-top"><span>태그</span>{[...(element["콘텐츠"] ? element["콘텐츠"].split(",") : []), ...(element["기간"] ? element["기간"].split(",") : []), ...(element["인물"] ? element["인물"].split(",") : [])].join(", ")}</div>
                                                    </SimpleBar>
                                                </div>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                            <div id="observer" style={{height: "10px"}}></div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }

    const [db, setDB] = useState(null);
    const [contents, setContents] = useState(null);
    const [intervals, setIntervals] = useState(null);
    const [characters, setCharacters] = useState(null);
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadingImg, setLoadingImg] = useState(null);
    const [intervalId, setIntervalId] = useState(null);

    async function initDB(){
        const SHEET_ID = process.env.REACT_APP_SHEET_ID;
        const base = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?`;
        const sheetName = '시트1';
        const query = encodeURIComponent('Select *');
        const url = `${base}&sheet=${sheetName}&tq=${query}`;

        const response = await fetch(url);
        const data = await response.text();
        const parsed = JSON.parse(data.substring(47).slice(0, -2));
        const db = parsed.table;

        db.rows.forEach((element, rowIndex) => {
            const row = {};
            
            element.c.forEach((col, colIndex) => {
                if(col === null){
                    row[db.cols[colIndex].label] = '';
                }
                else{
                    row[db.cols[colIndex].label] = col.f ? col.f : col.v;
                }
            });

            db.rows[rowIndex] = row;
        });

        return db;
    }

    function getTags(db, tag){
        const list = {};

        db.rows.forEach((element, index) => {
            if(element[tag] !== null){
                element[tag].split(",").forEach(element => {
                    if(!(element in list)){
                        list[element] = {contentsNum: []};
                    }
                    list[element].contentsNum.push(index);
                });
            }
        });

        return list;
    }
    
    useEffect(() => {
        const id = setInterval(() => {
            setLoadingImg(topImages[Math.floor(Math.random() * 4)]);
        }, 100);

        setIntervalId(id);
        
        initDB().then(
            db => {
                setDB(db);
                setContents(getTags(db, "콘텐츠"));
                setIntervals(getTags(db, "기간"));
                setCharacters(getTags(db, "인물"));
                setIsLoaded(true);
            },
            error => {
                setError(error);
                setIsLoaded(true);
            }
        );

        document.querySelector("body")
                .addEventListener("click", e => {
                    const more = document.querySelector(".content-container li.detail");
                    
                    if(more){
                        more.classList.remove("detail");
                    }
                });
    }, []);

    if(error){
        return <div>Error: {error.message}</div>;
    }
    else if(!isLoaded){
        return (
            <div style={{display: "flex", justifyContent: "center", height: "calc(100vh - 100px)"}}>
                <img src={loadingImg} height="150" style={{alignSelf: "center"}} alt="로딩중" />
            </div>
        );
    }
    else{
        clearInterval(intervalId);
        return (<Contents db={db} contents={contents} intervals={intervals} characters={characters} />);
    }
};

export default Contents;