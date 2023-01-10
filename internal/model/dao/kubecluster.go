package dao

import (
	"github.com/gotomicro/ego/core/elog"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type KubeCluster struct {
	Name       string `gorm:"type:varchar(60);index:name,unique" json:"name"`
	ApiServer  string `gorm:"type:varchar(60)" json:"apiServer"`
	KubeConfig string `gorm:"type:text" json:"kubeConfig"`
}

func Migrate(db *gorm.DB) error {
	return db.Debug().Migrator().AutoMigrate(&KubeCluster{})
}

func ClusterList(db *gorm.DB) ([]*KubeCluster, error) {
	var ret []*KubeCluster
	err := db.Table("kube_clusters").Find(&ret).Error
	if err != nil {
		elog.Error("get cluster list error", zap.Error(err))
		return nil, err
	}
	return ret, err
}

func GetClusterByName(db *gorm.DB, name string) (*KubeCluster, error) {
	var ret KubeCluster
	err := db.Table("kube_clusters").Where("name=?", name).First(&ret).Error
	if err != nil {
		elog.Error("get cluster by name error", zap.Error(err), zap.String("name", name))
		return nil, err
	}
	return &ret, err
}

func CreateCluster(db *gorm.DB, bean *KubeCluster) error {
	err := db.Table("kube_clusters").Create(bean).Error
	if err != nil {
		elog.Error("create cluster error", zap.Error(err), zap.Any("bean", bean))
		return err
	}
	return nil
}

func UpdateCluster(db *gorm.DB, bean *KubeCluster) error {
	err := db.Table("kube_clusters").Where("name=?", bean.Name).Save(bean).Error
	if err != nil {
		elog.Error("update cluster error", zap.Error(err), zap.Any("bean", bean))
		return err
	}
	return nil
}

func DeleteCluster(db *gorm.DB, name string) error {
	err := db.Table("kube_clusters").Where("name=?", name).Delete(&KubeCluster{}).Error
	if err != nil {
		elog.Error("delete cluster error", zap.Error(err), zap.String("name", name))
		return err
	}
	return nil
}
