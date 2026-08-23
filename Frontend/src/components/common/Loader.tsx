interface LoaderProps {
  text?: string;
}

const Loader = ({ text = 'Loading...' }: LoaderProps) => {
  return <div className="loader">{text}</div>;
};

export default Loader;
