import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../../modules/auth";
import Swal from "sweetalert2";

interface WebsiteUrl {
    website_id: string;
    url_hash: string;
    url: string;
    headers: Record<string, string>;
    last_render_at: string;
    status: string;
    status_code: number;
    depth: number;
    parent_url: string;
    is_archived: boolean;
}

const UpdateWebsiteUrl: React.FC = () => {
    const [formData, setFormData] = useState<WebsiteUrl>({
        website_id: '',
        url_hash: '',
        url: '',
        headers: {},
        last_render_at: '',
        status: 'Pending',
        status_code: 0,
        depth: 0,
        parent_url: '',
        is_archived: false
    });
    const navigate = useNavigate();
    const { auth } = useAuth();
    const { id } = useParams<{ id: string }>();

    const getWebsiteData = async () => {
        try {
            if (auth && auth.api_token) {
                const response = await fetch(`http://localhost:5000/api/get-website-url/${id}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`
                    }
                });
                const items = await response.json();
                const lastRenderAt = items.data?.last_render_at; // Access last_render_at safely
                let formattedDate = '';

                if (lastRenderAt) {
                    const date = new Date(lastRenderAt);
                    if (!isNaN(date.getTime())) { 
                        formattedDate = date.toISOString().slice(0, 16);
                    } else {
                        console.error('Invalid last_render_at date:', lastRenderAt);
                        formattedDate = ''; 
                    }
                }

                setFormData({
                    ...formData,
                    ...items.data,
                    last_render_at: formattedDate 
                });
            }
            else {
                console.error('No valid auth token available');
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleUpdateWebsite = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if(auth && auth.api_token){
                const response= await fetch(`http://localhost:5000/api/update-website-url/${id}`,{
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
                // const result= await response.json();

                if(response.ok){
                    Swal.fire({
                        position: 'center',
                        title: 'Success!',
                        text: 'Data updated successfully',
                        icon:'success',
                        confirmButtonText: 'OK'
                    }).then(() => navigate('/websiteurl'));
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
    }, [id, auth]);

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-80 mt-5 mb-5">
            <div className="card p-5 shadow-lg border-0 rounded-3" style={{ maxWidth: '550px', width: '100%' }}>
                <h2 className="text-center fw-bold mb-4">Update Websites Data</h2>

                <form className='form' onSubmit={handleUpdateWebsite}>
                    <div className="mb-4">
                        <label className="form-label fw-bold mb-1" htmlFor="name">Website ID:</label>
                        <input type="text" className="form-control bg-transparent" name="website_id" placeholder="Enter Website ID" value={formData.website_id} onChange={handleChange} required />
                    </div>

                    <div className="mb-5">
                        <label className="form-label fw-bold mb-1" htmlFor="url">URL Hash:</label>
                        <input type="text" className="form-control bg-transparent" name="url_hash" placeholder="Enter URL Hash" value={formData.url_hash} onChange={handleChange} required />
                    </div>

                    <div className="mb-5">
                        <label className="form-label fw-bold mb-1" htmlFor="url">URL:</label>
                        <input type="text" className="form-control bg-transparent" name="url" placeholder="Enter URL" value={formData.url} onChange={handleChange} required />
                    </div>

                    <div className="mb-5">
                        <label className="form-label fw-bold mb-1" htmlFor="url">Parent URL:</label>
                        <input type="text" className="form-control bg-transparent" name="parent_url" placeholder="Enter Parent URL" value={formData.parent_url} onChange={handleChange} />
                    </div>

                    <div className="mb-5">
                        <label className="form-label fw-bold mb-1" htmlFor="url">Last Render At:</label>
                        <input type="datetime-local" className="form-control bg-transparent" name="last_render_at" value={formData.last_render_at} onChange={(e) => setFormData({ ...formData, last_render_at: e.target.value })} />
                    </div>

                    <div className="mb-5">
                        <label className="form-label fw-bold mb-1" htmlFor="url">Status Code:</label>
                        <input type="number" className="form-control bg-transparent" name="status_code" placeholder="Enter Status Code" value={formData.status_code} onChange={handleChange} required />
                    </div>

                    <div className="mb-5">
                        <label className="form-label fw-bold mb-1" htmlFor="url">Depth:</label>
                        <input type="number" className="form-control bg-transparent" name="depth" placeholder="Enter Depth" value={formData.depth} onChange={handleChange} required />
                    </div>

                    <div className="mb-5">
                        <label className="form-label fw-bold mb-1" htmlFor="url">Is Achived:</label>
                        <input type="checkbox" className="form-check-input ms-3" name="is_archived" checked={formData.is_archived} onChange={(e) => setFormData({ ...formData, is_archived: e.target.checked })} />
                    </div>

                    {/* Submit Button */}
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">
                            Update
                        </button>
                        <Link to='/websiteurl'>
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

export { UpdateWebsiteUrl }