class ApiError extends Error {
    constructor(
        statustCode,
        message = "Something went wrong",
        errors = [],
        statck = ""
    ) {
        super(message);
        this.statustCode = statustCode;
        this.errors = errors;
        this.data = null;
        this.message = message
        this.success = false
        this.errors = errors
        if (statck) {
            this.statck = statck
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };