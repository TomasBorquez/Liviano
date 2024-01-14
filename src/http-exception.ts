type HTTPExceptionOptions = {
    message?: string
}

export class HTTPException extends Error {
    readonly status: number
    constructor(status: number = 500, options?: HTTPExceptionOptions) {
        super(options?.message)
        this.status = status
    }
}