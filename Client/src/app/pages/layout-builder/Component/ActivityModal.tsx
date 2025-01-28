import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

interface ActivityModalProps {
    show: boolean;
    onClose: () => void;
    timelineData: Array<{
        url: string;
        status: string;
        last_render_at: string | null;
        pending: string | null;
        errors: Array<{
            statusCode: number;
            errorType: string;
        }>;
    }>;
    loading: boolean;
}

const ActivityModal: React.FC<ActivityModalProps> = ({ show, onClose, timelineData, loading }) => {
    return (
        <Modal show={show} onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>URL Activity</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" />
                        <p>Loading data...</p>
                    </div>  
                ) : (
                    <div>
                        {timelineData.map((item, index) => (
                            <div key={index} className="mb-5">
                                <h5 className=''>
                                    <a href={item.url} target='_blank'>{item.url}</a>
                                </h5>
                                <hr />
                                <div className='tab-content'>
                                    <div className='timeline timeline-border-dashed'>
                                        {/* rendered */}
                                        {item.status === "Rendered" && item.last_render_at && (
                                            <div className='timeline-item'>
                                                <div className='timeline-line'></div>
                                                <div className='timeline-icon'>
                                                    <i className="ki-duotone ki-sms fs-2x "><span className="path1"></span><span className="path2"></span></i>
                                                </div>
                                                <div className='timeline-content mb-20 '>
                                                    <div className='pe-3 mb-5'>
                                                        <div className='fs-5 fw-semibold mt-1'>Rendered</div>
                                                        <div className="text-muted me-2 fs-7">Last rendered: {new Date(item.last_render_at).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Pending */}
                                        {item.status === 'Pending' && item.pending && (
                                            <div className='timeline-item'>
                                                <div className='timeline-line'></div>
                                                <div className='timeline-icon me-4'>
                                                    <i className="ki-duotone ki-flag fs-2 text-gray-500"><span className="path1"></span><span className="path2"></span></i>
                                                </div>
                                                <div className='timeline-content mb-20 '>
                                                    <div className='overflow-auto pe-3'>
                                                        <div className="fs-5 fw-semibold mt-1">Pending</div>
                                                        <div className="text-muted me-2 fs-7"> {new Date(item.pending).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Errors */}
                                        {item.errors && item.errors.length > 0 && (
                                            <>
                                                {item.errors.map((error, errorIndex) => (
                                                    <div key={errorIndex} className='timeline-item'>
                                                        <div className='timeline-line'></div>
                                                        <div className='timeline-icon'>
                                                            <i className="bi bi-exclamation-circle-fill fs-2"></i>
                                                        </div>
                                                        <div className='timeline-content mb-20 '>
                                                            <div className='mb-5 pe-3'>
                                                                <div className="fs-5 fw-semibold mt-1">Status Code: {error.statusCode}</div>
                                                                <div className="text-muted me-2 fs-7">Error : {error.errorType} </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}

                                        {/* <div className='timeline-item'>
                                            <div className='timeline-line'></div>
                                            <div className='timeline-icon'>
                                                <i className="bi bi-exclamation-circle-fill fs-2"></i>
                                            </div>
                                            <div className='timeline-content'>
                                                <div className='mb-5 pe-3'>
                                                    <div className="fs-5 fw-semibold text-gray-800 mt-1">500</div>
                                                    <div className="text-muted me-2 fs-7">error type: </div>
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ActivityModal;
