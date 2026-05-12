export interface LoginSuccessResponseJson{
    username: string
}

export interface LoginFailResponseJson{
    message: string
}

export interface productJson{
    all_product : productItem[]
}

export interface productItem{
    _id: string,
    name: string,
    user: string,
    detail: string,
    date: string,
    price: string,
    category: string,
    contactDetails: string,
    imageUri: string,
    locationName: string,
    latitude: string,
    longitude: string
}

export interface productAddItem{
    productId?: string,
    name: string,
    user: string,
    detail: string,
    date: string,
    price: string,
    category: string,
    contactDetails: string,
    imageUri: string,
    locationName: string,
    latitude: string,
    longitude: string
}
