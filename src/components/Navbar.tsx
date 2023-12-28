import { profileImage } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import { linkedInUrl, githubUrl } from '../utils/constants';
import './navbar.css'
function Navbar() {
    const navigate = useNavigate();

    const goHome = () => {
        navigate('/');
    }

    return (
        <div className="navbar-wrapper">
            <div className="navbar">
                <span className='nav-left-items' onClick={goHome}>
                    <div className='profile-wrapper'>
                        <img className="profile-pic" src={profileImage} />
                        <span className='profile-name'>Jim Crews</span>
                    </div>

                </span>
                <span className='nav-right-items'>
                    <span className='nav-text-item' style={{ paddingRight: "20px" }}>Archive</span>
                    <a className='nav-text-item' style={{ paddingRight: "20px" }} href={linkedInUrl} target="_blank">LinkedIn</a>
                    <a className='nav-text-item' href={githubUrl} target="_blank">Github</a>
                </span>
            </div>
            <div className='nav-mobile-items'>
                <span className='nav-text-item' style={{ paddingRight: "20px" }}>Archive</span>
                <span className='nav-text-item' style={{ paddingRight: "20px" }}>LinkedIn</span>
                <span className='nav-text-item'>Github</span>
            </div>
        </div>
    )
}
export default Navbar