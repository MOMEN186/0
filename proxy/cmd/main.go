package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/dovakiin0/proxy-m3u8/config"
	"github.com/dovakiin0/proxy-m3u8/internal/handler"
	mdlware "github.com/dovakiin0/proxy-m3u8/internal/middleware"
)

var (
	// Version will be set at build time
	Version = "dev"
)

func init() {
	// Load environment variables
	if err := godotenv.Load(); err != nil && !os.IsNotExist(err) {
		fmt.Printf("Error loading .env file: %v\n", err)
	}

	// Initialize configuration
	config.InitConfig()
}

func main() {
	e := echo.New()
	e.HideBanner = true
	e.Server.ReadTimeout = 30 * time.Second
	e.Server.WriteTimeout = 30 * time.Second

	// Middleware stack
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: `${time_rfc3339} | ${status} | ${method} ${uri} | ${latency_human}` + "\n",
	}))
	e.Use(middleware.RecoverWithConfig(middleware.RecoverConfig{
		DisablePrintStack: true,
	}))
	e.Use(middleware.Secure())
	e.Pre(middleware.RemoveTrailingSlash())

	// CORS configuration
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     parseCorsDomains(),
		AllowMethods:     []string{http.MethodGet, http.MethodHead, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           3600,
	}))

	// Cache control middleware
	e.Use(mdlware.CacheControlWithConfig(mdlware.CacheControlConfig{
		MaxAge:         3600,
		Public:         true,
		MustRevalidate: true,
	}))

	// Routes
	e.GET("/", handler.M3U8ProxyHandler)
	e.GET("/health", healthCheck)
	e.GET("/debug", debugHandler)

	// Start server
	serverAddr := fmt.Sprintf(":%s", config.Env.Port)
	e.Logger.Infof("Starting M3U8 Proxy v%s on %s", Version, serverAddr)
	
	if err := e.Start(serverAddr); err != nil && err != http.ErrServerClosed {
		e.Logger.Fatal("Shutting down server: ", err)
	}
}

func healthCheck(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status":  "healthy",
		"version": Version,
	})
}

func debugHandler(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{
		"service":   "m3u8-proxy",
		"version":   Version,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"config": map[string]interface{}{
			"port":       config.Env.Port,
			"cors":       config.Env.CorsDomain,
		},
		"request": map[string]interface{}{
			"method":    c.Request().Method,
			"path":      c.Request().URL.Path,
			"query":     c.QueryParams(),
			"headers":   c.Request().Header,
			"client_ip": c.RealIP(),
		},
	})
}

func parseCorsDomains() []string {
	corsDomain := strings.TrimSpace(config.Env.CorsDomain)

	if corsDomain == "*" {
		return []string{"*"}
	}

	domains := strings.Split(corsDomain, ",")
	var result []string

	for _, domain := range domains {
		domain = strings.TrimSpace(domain)
		if domain == "" {
			continue
		}

		// Add both http and https versions if not specified
		if !strings.HasPrefix(domain, "http") {
			result = append(result, 
				"https://"+strings.TrimSuffix(domain, "/"),
				"http://"+strings.TrimSuffix(domain, "/"),
			)
		} else {
			// Ensure consistent formatting
			domain = strings.TrimSuffix(domain, "/")
			if !strings.HasSuffix(domain, "/") {
				result = append(result, domain)
			}
		}
	}

	return result
}