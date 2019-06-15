import { Request, Response, NextFunction } from 'express'

export default function SecurityHeaders(req: Request, res: Response, next: NextFunction) {
    const securityheaders = [   
        ["Content-Security-Policy", "default-src 'self'; script-src 'self'; object-src 'none';"],
        ["X-XSS-Protection", "1; mode=block"],
        ["X-Frame-Options", "deny"],
        ["X-Content-Type-Options", "nosniff"],
        ["X-Powered-By", "PHP/7.2.18"],
    ]

    securityheaders.forEach(([key, val]) => res.setHeader(key, val))
    next()
}
