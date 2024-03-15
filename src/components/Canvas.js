import { useEffect, useRef, useState } from "react";

export const Canvas = ({
    draw, step,
    initialize, initialized,
    setMainContext,
    fps=30, width="100%", height="100%", backgroundColor="#fff",
    ...rest
}) => {

    const canvasRef = useRef(null);
    const [context, setContext] = useState(null);

    const resizeCanvas = context => {
        const canvas = context.canvas;
        const { width, height } = canvas.getBoundingClientRect();

        if (canvas.width !== width || canvas.height !== height) {
            const { devicePixelRatio: ratio = 1} = window;
            canvas.width = width * ratio;
            canvas.height = height * ratio;
            context.scale(ratio, ratio);
            return true;
        }

        return false;
    }

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const currentContext = canvas.getContext("2d");
            setContext(currentContext);
            resizeCanvas(currentContext);
            if (setMainContext) {
                setMainContext(currentContext);
            }
        }

        else {
            setContext(null);
        }
    }, [setMainContext]);

    useEffect(() => {
        let animationFrameID, fpsInterval, now, then, elapsed;

        if (context) {
            const render = () => {
                animationFrameID = window.requestAnimationFrame(render);
                now = Date.now();
                elapsed = now - then;
                if (elapsed > fpsInterval) {
                    then = now - (elapsed % fpsInterval);

                    if (!initialized()) {
                        initialize();
                    }

                    step();
                    draw(context);
                }
            }
            
            const startRendering = fps => {
                fpsInterval = 1000 / fps;
                then = Date.now();
                render();
            }

            startRendering(fps);
        }

        return () => {
            window.cancelAnimationFrame(animationFrameID);
        }
    }, [fps, initialize, initialized, step, draw, context]);

    return (
        <canvas onKeyDown={() => console.log("asduiasd")} ref={canvasRef} {...rest} style={{ width, height, backgroundColor, position:"absolute" }} />
    )
}