import { convertToDisplayDate } from './convertUtils'
const getDeparture = (trip) => {
    if (trip)
        if (trip.tripInfor.turn === 1) return trip.tripInfor.route.departure.name
        else return trip.tripInfor.route.destination.name
}
const getDestination = (trip) => {
    if (trip)
        if (trip.tripInfor.turn === 1) return trip.tripInfor.route.destination.name
        else return trip.tripInfor.route.departure.name
}
export const getTripDeparture = (trip) => {
    if (trip)
        if (trip.turn === 1) return trip.route.departure.name
        else return trip.route.destination.name
}
export const getTripDestination = (trip) => {
    if (trip)
        if (trip.turn === 1) return trip.route.destination.name
        else return trip.route.departure.name
}
export const getStartStation = (trip) => {
    if (trip)
        if (trip.tripInfor.turn === 1) return trip.tripInfor.startStation.name
        else return trip.tripInfor.endStation.name
}
export const getEndStation = (trip) => {
    if (trip)
        if (trip.tripInfor.turn === 1) return trip.tripInfor.endStation.name
        else return trip.tripInfor.startStation.name
}
export const getRouteName = (trip) => {
    return getDeparture(trip) + '-' + getDestination(trip)
}
export const getTripName = (trip) => {
    return getStartStation(trip) + '-' + getEndStation(trip)
}
export const getTripRoute = (trip) => {
    return getTripDeparture(trip) + '-' + getTripDestination(trip)
}

export const getBookingTrip = (booking) => {
    if (booking.trip.turn === 1)
        return booking.trip.startStation.name + '-' + booking.trip.endStation.name
    else return booking.trip.endStation.name + '-' + booking.trip.startStation.name
}

export const getDateAndTimeTicket = (ticket) => {
    return (
        ticket.schedule.departTime.slice(0, -3) +
        '-' +
        convertToDisplayDate(ticket.schedule.departDate)
    )
}

export const getDateAndTimeSchedule = (schedule) => {
    return schedule.departTime.slice(0, -3) + '-' + convertToDisplayDate(schedule.departDate)
}

export const getRouteJourney = (route) => {
    return route.departure.name + ' - ' + route.destination.name
}

export const getTripJourney = (trip) => {
    if (trip.turn === true) return trip.startStation.name + '-' + trip.endStation.name
    else return trip.endStation.name + '-' + trip.startStation.name
}

export const getTripStartStation = (trip) => {
    if (trip)
        if (trip.turn === 1) return trip.startStation.name
        else return trip.endStation.name
}
export const getTripEndStation = (trip) => {
    if (trip)
        if (trip.turn === 1) return trip.endStation.name
        else return trip.startStation.name
}
