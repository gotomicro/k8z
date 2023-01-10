package filesystem

import (
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"k8z/pkg/storage"
)

type Client struct {
	basePath string
}

func NewFilesystemClient(basePath string) *Client {
	return &Client{basePath: basePath}
}

var _ storage.Client = &Client{}

func (c Client) GetBytes(ctx context.Context, key string) ([]byte, error) {
	f, err := os.Open(filepath.Join(c.basePath, key))
	if err != nil {
		if os.IsNotExist(err) {
			return nil, storage.ErrNotFound
		}
		return nil, fmt.Errorf("open file error: %w", err)
	}
	defer f.Close()
	return ioutil.ReadAll(f)
}

func (c Client) PutBytes(ctx context.Context, key string, data []byte) error {
	path := key[:strings.LastIndex(key, string(filepath.Separator))]
	err := os.MkdirAll(filepath.Join(c.basePath, path), 0755)
	if err != nil {
		return fmt.Errorf("mkdir error: %w", err)
	}
	f, err := os.OpenFile(filepath.Join(c.basePath, key), os.O_WRONLY|os.O_CREATE, 0755)
	if err != nil {
		return fmt.Errorf("open file error: %w", err)
	}
	defer f.Close()
	_, err = f.Write(data)
	if err != nil {
		return err
	}
	return nil
}

func (c Client) List(ctx context.Context, key string) ([]string, error) {
	ps, err := os.ReadDir(filepath.Join(c.basePath, key))
	if err != nil {
		if os.IsNotExist(err) {
			return nil, storage.ErrNotFound
		}
		return nil, err
	}
	var out []string
	for _, p := range ps {
		out = append(out, p.Name())
	}
	return out, nil
}

func (c Client) Delete(ctx context.Context, key string) error {
	return os.Remove(filepath.Join(c.basePath, key))
}
