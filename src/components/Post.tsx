import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import request from '../utils/requests';
import { blogDataUrl } from '../utils/constants';
import Blog from '../types/Blog';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import './post.css';

function Post() {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const slug = searchParams.get("slug");
    const [postObj, setPostObj] = useState<Blog | undefined>(undefined);
    const [markdown, setMarkdown] = useState<string | undefined>(undefined);
    const [isError, setIsError] = useState<boolean>(false);

    useEffect(() => {
        setIsError(false);
        if (!postObj && location?.state) {
            // received blog post from state
            setPostObj(location.state)
        } else {
            // new request for blog data
            request<Array<Blog>>(blogDataUrl)
                .then(data => {
                    const downloadPost = data.find(item => item.slug === slug?.replace('/', ''));
                    setPostObj(downloadPost);
                })
                .catch(error => {
                    console.error(error.message);
                    setIsError(true);
                })
        }
    }, [])

    useEffect(() => {
        if (postObj && !markdown && !isError) {
            fetch(postObj.markdown)
                .then(res => res.text())
                .then(downloadMarkdown => {
                    setMarkdown(downloadMarkdown);
                })
        }
    }, [postObj])



    return (
        <div className="post-wrapper">

            {isError && <h3 style={{ marginTop: "100px" }}>Sorry, hit an ERROR. Can't load post..</h3>}

            {postObj && !isError && (
                <>
                    <h2 className='post-heading'>{postObj.title}</h2>
                    <div className='post-date'>{postObj.date}</div>

                    {postObj.cover && (
                        <div className='post-cover-image-wapper'>
                            <img className="profile-pic" src={postObj?.cover} alt="profile picture" />
                        </div>
                    )}
                    {markdown && <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>}
                </>
            )}


        </div>
    )
}

export default Post;