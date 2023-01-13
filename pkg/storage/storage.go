package storage

import (
	"context"
	"errors"
)

var (
	ErrNotFound = errors.New("not found")
)

type Client interface {
	GetBytes(ctx context.Context, key string) ([]byte, error)
	PutBytes(ctx context.Context, key string, data []byte) error
	Delete(ctx context.Context, key string) error
	List(ctx context.Context, key string) ([]string, error)
}
