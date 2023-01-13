import { DefaultFooter } from '@ant-design/pro-components';

const Footer: React.FC = () => {
  const defaultMessage = '石墨文档_SRE';

  const currentYear = new Date().getFullYear();

  return (
    <DefaultFooter
      style={{
        background: 'none',
        height: 22,
      }}
      copyright={`${currentYear} ${defaultMessage}`}
    />
  );
};

export default Footer;
