package main

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/redis/go-redis/v9"

	"github.com/dovakiin0/proxy-m3u8/config"
	"github.com/dovakiin0/proxy-m3u8/internal/handler"
	mdlware "github.com/dovakiin0/proxy-m3u8/internal/middleware"
)

func init() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		fmt.Printf("Warning: Could not load .env file: %v\n", err)
	}

	// Initialize configuration
	config.InitConfig()

	// Initialize Redis connection
	if err := config.RedisConnect(); err != nil {
		panic(fmt.Sprintf("Failed to connect to Redis: %v", err))
	}
}

func main() {
	e := echo.New()
	e.HideBanner = true
	e.Server.ReadTimeout = 30 * time.Second
	e.Server.WriteTimeout = 30 * time.Second

	// Middleware
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: `${time_rfc3339} | ${status} | ${method} ${uri} | ${latency_human}` + "\n",
	}))
	e.Use(middleware.Recover())
	e.Use(middleware.Secure())
	e.Pre(middleware.RemoveTrailingSlash())

	// CORS Configuration
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     getCorsDomains(),
		AllowMethods:     []string{http.MethodGet, http.MethodHead, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           3600,
	}))

	// Cache Control Middleware
	e.Use(mdlware.CacheControlWithConfig(mdlware.CacheControlConfig{
		MaxAge:         3600, // 1 hour
		Public:         true,
		MustRevalidate: true,
	}))

	// Routes
	e.GET("/", handler.M3U8ProxyHandler)
	e.GET("/health", healthCheck)
	e.GET("/debug", debugHandler)

	// Start server
	serverAddr := fmt.Sprintf(":%s", config.Env.Port)
	e.Logger.Infof("Starting server on %s", serverAddr)
	
	if err := e.Start(serverAddr); err != nil && err != http.ErrServerClosed {
		e.Logger.Fatal("Shutting down the server: ", err)
	}
}

// Health check endpoint
func healthCheck(c echo.Context) error {
	// Check Redis connection if needed
	if _, err := config.Redis.Ping(c.Request().Context()).Result(); err != nil {
		return c.JSON(http.StatusServiceUnavailable, map[string]string{
			"status":  "unhealthy",
			"message": "Redis connection failed",
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status":  "healthy",
		"version": config.Env.Version,
	})
}

// Debug endpoint to verify routing and middleware
func debugHandler(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{
		"service":    "m3u8-proxy",
		"timestamp":  time.Now().UTC(),
		"request": map[string]interface{}{
			"method":     c.Request().Method,
			"path":       c.Request().URL.Path,
			"query":      c.QueryParams(),
			"headers":    c.Request().Header,
			"remote_ip":  c.RealIP(),
			"user_agent": c.Request().UserAgent(),
		},
		"config": map[string]interface{}{
			"port":       config.Env.Port,
			"cors":       config.Env.CorsDomain,
			"redis":      config.Redis != nil,
			"version":    config.Env.Version,
		},
	})
}

// Helper function to parse CORS domains
func getCorsDomains() []string {
	corsDomain := strings.TrimSpace(config.Env.CorsDomain)

	if corsDomain == "*" {
		return []string{"*"}
	}

	domains := strings.Split(corsDomain, ",")
	var allowOrigins []string

	for _, domain := range domains {
		domain = strings.TrimSpace(domain)
		if domain == "" {
			continue
		}

		// Ensure proper URL format
		if !strings.HasPrefix(domain, "http://") && !strings.HasPrefix(domain, "https://") {
			allowOrigins = append(allowOrigins, 
				"https://"+strings.TrimSuffix(domain, "/"),
				"http://"+strings.TrimSuffix(domain, "/"),
			)
		} else {
			allowOrigins = append(allowOrigins, strings.TrimSuffix(domain, "/"))
		}
	}

	return allowOrigins
}