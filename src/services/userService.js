const BASE_URL = `${import.meta.env.VITE_BACKEND_SERVER_URL}/users`

const getAllUsers = async () => {
    try {
        const res = await fetch(BASE_URL, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
        const data = await res.json()
        return data
    } catch (error) {
        throw new Error(error.message)
    }
}

export {
    getAllUsers
}