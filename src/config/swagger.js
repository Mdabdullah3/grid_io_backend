import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "YouTube Clone API",
            version: "1.0.0",
            description: "API documentation for YouTube Clone",
        },
        servers: [
            {
                url: "http://localhost:8000",
                description: "Local server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
                googleOAuth: {
                    type: "oauth2",
                    flows: {
                        authorizationCode: {
                            authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
                            tokenUrl: "https://oauth2.googleapis.com/token",
                            scopes: {
                                profile: "Access user profile information",
                                email: "Access user email address",
                            },
                        },
                    },
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                        },
                        fullName: {
                            type: "string",
                        },
                        email: {
                            type: "string",
                        },
                        username: {
                            type: "string",
                        },
                        avatar: {
                            type: "string",
                        },
                        coverImage: {
                            type: "string",
                        },
                        isVerified: {
                            type: "boolean",
                        },
                    },
                },
                Subscription: {
                    type: "object",
                    properties: {
                        subscriber: {
                            type: "string",
                            description: "User ID of the subscriber",
                        },
                        channel: {
                            type: "string",
                            description: "User ID of the channel to which the user is subscribed",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.js", "./src/docs/*.js"], // Include both route and docs files
};

const specs = swaggerJsdoc(options);
export default specs;
