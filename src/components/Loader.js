import Spinner from "./Spinner";

const Loader = () => {
    return (
        <div className="flex justify-center items-center h-screen w-screen">
            <div className="flex flex-col items-center justify-center space-y-4">
                <Spinner size={15} color={"text-success"} />
                <p className="text-success">Loading...</p>
            </div>
        </div>
    );
}

export default Loader;