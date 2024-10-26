import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
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

const AddWebsiteUrl: React.FC = () => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (auth && auth.api_token) {
                const response = await fetch('http://localhost:5000/api/add-website-url', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${auth.api_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify( formData )
                })
                await response.json();

                if (response.ok) {
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Success',
                        text: 'Data Added successfully',
                        confirmButtonText: "OK"
                    }).then(() => {
                        navigate('/websiteurl')
                    })
                }
                else {
                    Swal.fire({
                        position: 'center',
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to add data',
                        confirmButtonText: "OK"
                    })
                }
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

    const handleHeadersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, headers: { ...formData.headers, [name]: value } });
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-80 mt-5 mb-5">
            <div className="card p-5 shadow-lg border-0 rounded-3" style={{ maxWidth: '550px', width: '100%' }}>
                <h2 className="text-center fw-bold mb-4">Enter Websites Data</h2>

                <form className='form' onSubmit={handleSubmit}>
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
                        <label className="form-label fw-bold mb-1" htmlFor="url">Headers:</label>
                        <input type="text" className="form-control bg-transparent" name="User-Agent" placeholder="Enter Headers" onChange={handleHeadersChange} />
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
                            Submit
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

export { AddWebsiteUrl }