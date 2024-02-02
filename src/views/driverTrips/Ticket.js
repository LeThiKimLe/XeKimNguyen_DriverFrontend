import React from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCardSubtitle,
    CCardText,
    CCol,
    CRow,
    CCardFooter,
    CToaster,
    CSpinner,
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useState, useRef } from 'react'
import {
    cilPlus,
    cilChevronDoubleUp,
    cilChevronDoubleDown,
    cilPencil,
    cilCheck,
} from '@coreui/icons'
import { CButton } from '@coreui/react'
import { useDispatch } from 'react-redux'
import { useEffect, memo } from 'react'
import driverThunk from 'src/feature/driver/driver.service'
import { selectCurrentTime } from 'src/feature/driver/driver.slice'
import { useSelector } from 'react-redux'
import { CustomToast } from '../customToast/CustomToast'
import MediaQuery from 'react-responsive'
import seat_paid from 'src/assets/items/seat_paid.svg'
import seat_empty from 'src/assets/items/seat_empty.svg'
import seat_checkedin from 'src/assets/items/seat_checkedin.svg'
import seat_unpaid from 'src/assets/items/seat_unpaid.svg'

const Ticket = ({ seat, ticket, empty, updateList }) => {
    const dispatch = useDispatch()
    const [toast, addToast] = useState(0)
    const timeProps = useSelector(selectCurrentTime)
    const [checkedIn, setCheckedIn] = useState(ticket ? ticket.checkedIn : false)
    const toaster = useRef('')
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const getItemColor = () => {
        if (ticket)
            if (ticket.state === 'Đã thanh toán') return 'success'
            else if (ticket.state === 'Chờ thanh toán') return 'warning'
            else return 'dark'
        else return 'dark'
    }

    const handleCheckIn = () => {
        if (checkedIn === false) {
            setLoading(true)
            dispatch(driverThunk.checkInTicket(ticket.id))
                .unwrap()
                .then(() => {
                    setLoading(false)
                    setCheckedIn(true)
                    updateList()
                })
                .catch((error) => {
                    addToast(() => CustomToast({ message: error, type: 'info' }))
                })
        }
    }

    if (empty) {
        return (
            <div style={{ width: 'fit-content' }}>
                <MediaQuery minWidth={878}>
                    <CCard
                        style={{ width: '250px', height: '320px', visibility: 'hidden' }}
                    ></CCard>
                </MediaQuery>
                <MediaQuery maxWidth={878}>
                    <CCard style={{ width: '33px', height: '35px', visibility: 'hidden' }}></CCard>
                </MediaQuery>
            </div>
        )
    } else {
        if (ticket && ticket.state !== 'Đã hủy')
            return (
                <div style={{ width: 'fit-content' }}>
                    <CToaster ref={toaster} push={toast} placement="top-end" />
                    <MediaQuery minWidth={878}>
                        <CCard
                            id={seat.name}
                            style={{ width: '250px', height: '280px' }}
                            className={`mb-3 border-${getItemColor()} border-3`}
                        >
                            <CCardHeader className={`bg-${getItemColor()}`}>
                                <CRow>
                                    <CCol sm="4">
                                        <strong>{seat.name}</strong>
                                    </CCol>
                                    <CCol className="d-flex justify-content-end" sm="8">
                                        {!loading && (
                                            <i>
                                                <b>{checkedIn ? 'Đã lên xe' : ''}</b>
                                            </i>
                                        )}
                                        {loading && <CSpinner size="sm"></CSpinner>}
                                    </CCol>
                                </CRow>
                            </CCardHeader>
                            <CCardBody style={{ maxHeight: '220px' }} className="overflow-auto">
                                <CCardText className="mb-1">
                                    <b>{`SĐT: ${ticket.booking.tel}`}</b>
                                </CCardText>
                                <CCardText className="mb-1">{`KH: ${ticket.booking.name}`}</CCardText>
                                <CCardText className="mb-1">{`Mã vé: ${ticket.booking.code}`}</CCardText>
                                <CRow className="justify-content-end">
                                    <CCol style={{ textAlign: 'right' }} xs="10">
                                        <span>{ticket.booking.pickStation.station.name}</span>
                                    </CCol>
                                    <CCol xs="2">
                                        <CIcon icon={cilChevronDoubleUp}></CIcon>
                                    </CCol>
                                </CRow>
                                <CRow className="justify-content-end">
                                    <CCol style={{ textAlign: 'right' }} xs="10">
                                        <span>{ticket.booking.dropStation.station.name}</span>
                                    </CCol>
                                    <CCol xs="2">
                                        <CIcon icon={cilChevronDoubleDown}></CIcon>
                                    </CCol>
                                </CRow>
                                <CCardText>
                                    {ticket.booking.conductStaff ? (
                                        <small className="text-medium-emphasis">
                                            {`NV đặt vé: ${ticket.booking.conductStaff.nickname.slice(
                                                3,
                                            )}`}
                                        </small>
                                    ) : (
                                        <small className="text-medium-emphasis">{`Đặt vé online`}</small>
                                    )}
                                </CCardText>
                            </CCardBody>
                            <CCardFooter>
                                <CRow className="justify-content-center">
                                    <CCol xs="4" className="p-0 d-flex justify-content-center">
                                        <CButton
                                            id={'check-in-' + seat.name}
                                            variant="outline"
                                            color="success"
                                            onClick={handleCheckIn}
                                            disabled={timeProps !== 'current' || checkedIn}
                                        >
                                            <CIcon icon={cilCheck}></CIcon>
                                        </CButton>
                                    </CCol>
                                </CRow>
                            </CCardFooter>
                        </CCard>
                    </MediaQuery>
                    <MediaQuery maxWidth={878}>
                        <div
                            className="position-relative cursor-pointer"
                            onClick={() => setShowModal(true)}
                        >
                            {ticket.state === 'Đã thanh toán' && checkedIn && (
                                <img src={seat_checkedin} alt="seat_checkedin" />
                            )}
                            {ticket.state === 'Đã thanh toán' && !checkedIn && (
                                <img src={seat_paid} alt="seat_paid" />
                            )}
                            {ticket.state === 'Chờ thanh toán' && (
                                <img src={seat_unpaid} alt="seat_unpaid" />
                            )}
                            <div className="seatname">{seat.name}</div>
                        </div>
                        <CModal
                            size="sm"
                            alignment="center"
                            visible={showModal}
                            onClose={() => setShowModal(false)}
                        >
                            <CModalHeader>
                                <CRow>
                                    <CCol sm="4">
                                        <strong>{seat.name}</strong>
                                    </CCol>
                                    <CCol className="d-flex justify-content-end" sm="8">
                                        {!loading && (
                                            <i>
                                                <b>{checkedIn ? 'Đã lên xe' : ''}</b>
                                            </i>
                                        )}
                                        {loading && <CSpinner size="sm"></CSpinner>}
                                    </CCol>
                                </CRow>
                            </CModalHeader>
                            <CModalBody>
                                <CCardText className="mb-1">
                                    <b>{`SĐT: ${ticket.booking.tel}`}</b>
                                </CCardText>
                                <CCardText className="mb-1">{`KH: ${ticket.booking.name}`}</CCardText>
                                <CCardText className="mb-1">{`Mã vé: ${ticket.booking.code}`}</CCardText>
                                <CRow className="justify-content-end">
                                    <CCol style={{ textAlign: 'right' }} xs="10">
                                        <span>{ticket.booking.pickStation.station.name}</span>
                                    </CCol>
                                    <CCol xs="2">
                                        <CIcon icon={cilChevronDoubleUp}></CIcon>
                                    </CCol>
                                </CRow>
                                <CRow className="justify-content-end">
                                    <CCol style={{ textAlign: 'right' }} xs="10">
                                        <span>{ticket.booking.dropStation.station.name}</span>
                                    </CCol>
                                    <CCol xs="2">
                                        <CIcon icon={cilChevronDoubleDown}></CIcon>
                                    </CCol>
                                </CRow>
                                <CCardText>
                                    {ticket.booking.conductStaff ? (
                                        <small className="text-medium-emphasis">
                                            {`NV đặt vé: ${ticket.booking.conductStaff.nickname.slice(
                                                3,
                                            )}`}
                                        </small>
                                    ) : (
                                        <small className="text-medium-emphasis">{`Đặt vé online`}</small>
                                    )}
                                </CCardText>
                            </CModalBody>
                            <CModalFooter>
                                <CRow className="justify-content-center">
                                    <CCol xs="4" className="p-0 d-flex justify-content-center">
                                        <CButton
                                            id={'check-in-' + seat.name}
                                            variant="outline"
                                            color="success"
                                            onClick={handleCheckIn}
                                            disabled={timeProps !== 'current' || checkedIn}
                                        >
                                            <CIcon icon={cilCheck}></CIcon>
                                        </CButton>
                                    </CCol>
                                </CRow>
                            </CModalFooter>
                        </CModal>
                    </MediaQuery>
                </div>
            )
        else {
            return (
                <div style={{ width: 'fit-content' }}>
                    <CToaster ref={toaster} push={toast} placement="top-end" />
                    <MediaQuery minWidth={878}>
                        <CCard
                            style={{ width: '250px', height: '280px' }}
                            className={`mb-3 border-${getItemColor()} border-3`}
                        >
                            <CCardHeader className="d-flex justify-content-between align-items-center">
                                <strong>{seat.name}</strong>
                            </CCardHeader>
                            <CCardBody></CCardBody>
                            <CCardFooter>
                                <CRow className="justify-content-center">
                                    <CCol xs="4" className="p-0 d-flex justify-content-center">
                                        <CButton variant="outline" color="success" disabled={true}>
                                            <CIcon icon={cilCheck}></CIcon>
                                        </CButton>
                                    </CCol>
                                </CRow>
                            </CCardFooter>
                        </CCard>
                    </MediaQuery>
                    <MediaQuery maxWidth={878}>
                        <div className="position-relative cursor-pointer">
                            <img src={seat_empty} alt="seat_empty" />
                            <div className="seatname">{seat.name}</div>
                        </div>
                    </MediaQuery>
                </div>
            )
        }
    }
}

export default memo(Ticket)
