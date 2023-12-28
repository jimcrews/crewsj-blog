import {useEffect, useState} from 'react'
import Blog from '../types/Blog';
import request from '../utils/requests';
import { blogDataUrl } from '../utils/constants';
import { Link } from "react-router-dom";
import './home.css'

function Home() {
    const [data, setData] = useState<Array<Blog>>([])
    const [isError, setIsError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        setIsError(false);
        request<Array<Blog>>(blogDataUrl)
            .then(data => {
                setData(data);
            })
            .catch(error => {
                console.error(error.message);
                setIsError(true);
            })
            .finally(() => setIsLoading(false))
    }, [])

    const post_route = (slug: string) => `/post?slug=${slug}/`;

    const date_sort = (a: Blog, b: Blog): number => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }

    const sortedData = data.sort(date_sort)

    return (
        <div className="home-wrapper">

            {isError && <h3 style={{ marginTop: "100px" }}>Sorry, hit an ERROR. Can't load page..</h3>}
            {!isLoading && sortedData.length === 0 && <h3 style={{ marginTop: "100px" }}>Error. No data was received..</h3>}

            {sortedData.map((blog: Blog) =>
                <div className="all-posts-wrapper" key={blog.id}>

                    <div className="post-details">

                        <Link to={post_route(blog.slug)} state={blog} className='post-heading'><h2>{blog.title}</h2></Link>
                        <div className='post-date'>{blog.date}</div>

                        {blog.cover && (
                            <div className='post-cover-image-wapper'>
                                <img className="profile-pic" src={blog.cover} alt="profile picture" />
                            </div>
                        )}

                        <p>{blog.tldr}</p>

                        <Link className='post-read-more' to={post_route(blog.slug)} state={blog}><p>Read More</p></Link>


                    </div>

                </div>
            )}

        </div>
    )
}

export default Home;