import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../../modules/auth";
import Swal from "sweetalert2";

const UpdateWebsite: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [url, setURL] = useState<string>('');
    const navigate = useNavigate();
    const { auth } = useAuth();
    const { id } = useParams<{ id: string }>();

    const getWebsiteData = async () => {
        try {
            if (auth && auth.api_token) {
                const response = await fetch(`http://localhost:5000/api/websites/${id}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`
                    }
                });
                const items = await response.json();
                setName(items.data.name);
                setURL(items.data.url);
            }
            else {
                console.error('No valid auth token available');
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleUpdateWebsite = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if(auth && auth.api_token){
                const response= await fetch(`http://localhost:5000/api/website/update/${id}`,{
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        url
                    })
                })
                // const result= await response.json();

                if(response.ok){
                    Swal.fire({
                        position: 'center',
                        title: 'Success!',
                        text: 'Data updated successfully',
                        icon:'success',
                        confirmButtonText: 'OK'
                    }).then(() => navigate('/builder'));
                }
                else{
                    console.error('Error updating websites',response.statusText);
                    Swal.fire({
                        position: 'center',
                        title: 'Error!',
                        text: 'Error updating data. Please try again',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    })
                }
            }
            else{
                console.error('No valid auth token available');
            }
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(() => {
        getWebsiteData();
    }, [id,auth]);

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-80">
            <div className="card p-5 shadow-lg border-0 rounded-3" style={{ maxWidth: '550px', width: '100%' }}>
                <h2 className="text-center fw-bold mb-4">Update Websites Name And URL</h2>

                <form className='form' onSubmit={handleUpdateWebsite}>
                    <div className="mb-4">
                        <label className="form-label fw-bold mb-1" htmlFor="name">Name:</label>
                        <input type="text" className="form-control bg-transparent" id="name" placeholder="Enter Website Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="mb-5">
                        <label className="form-label fw-bold mb-1" htmlFor="url">URL:</label>
                        <input type="text" className="form-control bg-transparent" id="url" placeholder="Enter Website URL" value={url} onChange={(e) => setURL(e.target.value)} required />
                    </div>

                    {/* Submit Button */}
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">
                            Update
                        </button>
                        <Link to='/builder'>
                            <button
                                type='button'
                                id='kt_login_signup_form_cancel_button'
                                className='btn btn-lg btn-light-primary w-100 mb-0 mt-3'
                            >
                                Cancel
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export { UpdateWebsite }