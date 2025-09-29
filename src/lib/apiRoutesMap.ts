export const apiRoutesMap = {
    v1: {
        cars: {
            GET: '/api/v1/cars', // add id in the end for specific car
            POST: '/api/v1/cars',
            filters: '/api/v1/cars/filters',
            saved: '/api/v1/cars/saved',
        }
    }
}