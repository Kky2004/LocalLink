import { Link } from "react-router-dom"

export default function Notfound(){
    return(
        <>
        <div className=" flex flex-col mt-10 mb-10">
         <div className=" flex-col flex items-center justify-center text-center">
        <h1 className="text-3xl font-semibold mb-3">404! Page Not Found</h1>
        <p>
         Sorry the page your are looking for does not exist.
        </p>
        </div>
        </div>
        </>
    )
}