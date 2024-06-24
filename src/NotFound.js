import notFound from './images/404.jpg';

function NotFound(){
    return(
        <div style={{display: "flex", height: "calc(100vh - 90px - 8px)", alignItems: "center", justifyContent: "center", flexDirection: "column", fontSize: "3em", fontWeight: "600"}}>
            <p>Not Found</p>
            <img src={notFound} height="500" />
        </div>
    )
}

export default NotFound;