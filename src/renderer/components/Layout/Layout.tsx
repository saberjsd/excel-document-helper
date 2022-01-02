import Content from '../Content';
import Header from '../Header';
import Sidebar from '../Sidebar';
import './styles.scss';

export default function Layout(props: any) {
  return (
    <div className="layout_page">
      <Header>{props.header}</Header>
      <div className="layout_main">
        <Sidebar></Sidebar>
        <Content className={props.className}>{props.children}</Content>
      </div>
    </div>
  );
}
