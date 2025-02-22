class ApiError extends Error {
    constructor(
        statustCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statustCode = statustCode;
        this.errors = errors;
        this.data = null;
        this.message = message
        this.success = false
        this.errors = errors
        if (stack) {
            this.statck = stack
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };