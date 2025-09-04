import { Request, Response, NextFunction } from "express";
import chalk from "chalk";
import morgan from "morgan";

/**
 * Custom format for request logging
 */
const requestFormat = (tokens: any, req: Request, res: Response) => {
  // Get timestamp
  const date = new Date();
  const timestamp = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

  // Get method with color based on HTTP method
  const method = (() => {
    switch (req.method) {
      case "GET":
        return chalk.green.bold(req.method);
      case "POST":
        return chalk.blue.bold(req.method);
      case "PUT":
        return chalk.yellow.bold(req.method);
      case "DELETE":
        return chalk.red.bold(req.method);
      case "PATCH":
        return chalk.magenta.bold(req.method);
      default:
        return chalk.gray.bold(req.method);
    }
  })();

  // Get status with color based on status code
  const status = tokens.status(req, res);
  const coloredStatus = (() => {
    const statusCode = parseInt(status || "0", 10);
    if (statusCode >= 500) {
      return chalk.red.bold(status);
    } else if (statusCode >= 400) {
      return chalk.yellow.bold(status);
    } else if (statusCode >= 300) {
      return chalk.cyan.bold(status);
    } else if (statusCode >= 200) {
      return chalk.green.bold(status);
    } else {
      return chalk.gray.bold(status);
    }
  })();

  // Calculate response time
  const responseTime = tokens["response-time"](req, res);
  const coloredResponseTime = (() => {
    const time = parseFloat(responseTime || "0");
    if (time > 1000) {
      return chalk.red.bold(`${responseTime}ms`);
    } else if (time > 500) {
      return chalk.yellow.bold(`${responseTime}ms`);
    } else if (time > 100) {
      return chalk.cyan.bold(`${responseTime}ms`);
    } else {
      return chalk.green.bold(`${responseTime}ms`);
    }
  })();

  // Format URL
  const url = chalk.white(tokens.url(req, res));

  // Format content length
  const contentLength = tokens.res(req, res, "content-length") || "-";
  const formattedContentLength =
    contentLength === "-"
      ? chalk.gray("-")
      : chalk.gray(`${contentLength} bytes`);

  // Format remote address
  const remoteAddr = tokens["remote-addr"](req, res) || "-";
  const formattedRemoteAddr = chalk.gray(`from ${remoteAddr}`);

  // Construct and return the final formatted log
  return [
    `🕒 ${chalk.gray(timestamp)}`,
    `📨 ${method} ${url}`,
    `📊 ${coloredStatus}`,
    `⏱️  ${coloredResponseTime}`,
    `📦 ${formattedContentLength}`,
    `🌐 ${formattedRemoteAddr}`,
  ].join(" | ");
};

/**
 * Request and response logger middleware
 */
export const loggerMiddleware = morgan(requestFormat as any);

/**
 * More detailed logger for development environment
 */
export const developmentLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log request body if present
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(chalk.cyan.bold("\n📋 Request Body:"));
    console.log(chalk.cyan(JSON.stringify(req.body, null, 2)));
  }

  // Capture and log response body
  const originalSend = res.send;
  res.send = function (body: any) {
    // Only log response for non-binary responses
    const contentType = res.getHeader("content-type");
    if (
      contentType &&
      typeof body === "string" &&
      contentType.toString().includes("application/json")
    ) {
      console.log(chalk.magenta.bold("\n📬 Response Body:"));
      try {
        const parsedBody = JSON.parse(body);
        console.log(chalk.magenta(JSON.stringify(parsedBody, null, 2)));
      } catch (e) {
        console.log(chalk.magenta(body));
      }
    }

    // End with a separator for readability between requests
    console.log(chalk.gray("\n----------------------------------------\n"));

    return originalSend.call(this as any, body);
  };

  next();
};

/**
 * Error logger middleware
 */
export const errorLoggerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(chalk.red.bold("\n❌ ERROR:"));
  console.error(chalk.red(`${err.name}: ${err.message}`));

  if (err.stack) {
    console.error(chalk.red.dim(err.stack));
  }

  console.log(chalk.gray("\n----------------------------------------\n"));

  next(err);
};
