
import { Layout, Menu, Button } from "antd";
import { Link } from "react-router-dom";

const { Header } = Layout;

const HeaderApp = () => {
    return (
        <Header
            className="flex items-center justify-between bg-white shadow-md px-6 py-0"
        >
            {/* Logo */}
            <div className="text-xl font-bold text-blue-600">
                <Link to="/">EV_Exchange</Link>
            </div>

            {/* Navigation Menu */}
            <Menu
                mode="horizontal"
                defaultSelectedKeys={["1"]}
                items={[
                    { key: "1", label: <Link to="/">Home</Link> },
                    { key: "2", label: <Link to="/about">About</Link> },
                    { key: "3", label: <Link to="/services">Services</Link> },
                    { key: "4", label: <Link to="/contact">Contact</Link> },
                ]}
                className="flex-1 ml-10"
            />

            {/* Buttons */}
            <div className="flex gap-2.5">
                <Link to="/login">
                    <Button type="default">Login</Button>
                </Link>
                <Link to="/signup">
                    <Button type="primary">Sign Up</Button>
                </Link>
            </div>
        </Header>
    );
};

export default HeaderApp;
