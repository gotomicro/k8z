package service

import (
	"k8z/internal/invoker"
	"k8z/internal/model/dao"
	"k8z/internal/service/kube"
)

func Init() error {
	err := dao.Migrate(invoker.DB)
	if err != nil {
		return err
	}
	err = kube.InitKube()
	if err != nil {
		return err
	}
	err = initPProf()
	if err != nil {
		return err
	}
	err = initTCPDump()
	if err != nil {
		return err
	}
	return nil
}
