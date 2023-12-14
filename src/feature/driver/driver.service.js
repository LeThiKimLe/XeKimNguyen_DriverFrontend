import { createAsyncThunk } from '@reduxjs/toolkit'
import axiosClient from 'src/api/axios'
import format from 'date-fns/format'

const getDriverTrip = createAsyncThunk('driver/trips/manage', async (driverId, thunkAPI) => {
    try {
        const trips = await axiosClient.get('driver/trips', {
            params: {
                driverId: driverId,
            },
        })
        return trips
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

const getDriverSchedules = createAsyncThunk(
    'driver/schedules/manage',
    async (driverId, thunkAPI) => {
        try {
            const trips = await axiosClient.get('driver/schedules', {
                params: {
                    driverId: driverId,
                },
            })
            return trips
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    },
)

const checkInTicket = createAsyncThunk('driver/ticket/checked-in', async (ticketId, thunkAPI) => {
    try {
        const result = await axiosClient.put('driver/ticket/checked-in', null, {
            params: {
                ticketId: ticketId,
            },
        })
        return result
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

const updateBusState = createAsyncThunk('driver/bus/state', async ({ id, busState }, thunkAPI) => {
    try {
        const bus = await axiosClient.put('driver/bus/state', null, {
            params: {
                id: id,
                brake: busState.brake,
                lighting: busState.lighting,
                tire: busState.tire,
                steering: busState.steering,
                mirror: busState.mirror,
                airCondition: busState.airCondition,
                electric: busState.electric,
                fuel: busState.fuel,
                updatedAt: format(new Date(), 'yyyy-MM-dd'),
                overallState: busState.overallState,
            },
        })
        return bus
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

const getScheduleInfor = createAsyncThunk(
    'driver/tickets/schedule-ticket',
    async (scheduleId, thunkAPI) => {
        try {
            const response = await axiosClient.get('driver/schedule-ticket', {
                params: {
                    scheduleId: scheduleId,
                },
            })
            return response
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    },
)

const driverThunk = {
    getDriverTrip,
    getDriverSchedules,
    checkInTicket,
    updateBusState,
    getScheduleInfor,
}
export default driverThunk
