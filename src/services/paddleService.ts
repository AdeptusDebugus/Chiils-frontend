
declare global {
    interface Window {
        Paddle: any;
    }
}

class PaddleService {
    private initialized = false;
    private env = import.meta.env.VITE_PADDLE_ENV || 'sandbox';
    private clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || 'test_token';

    initialize() {
        if (this.initialized) return;

        if (window.Paddle) {
            window.Paddle.Environment.set(this.env);
            window.Paddle.Setup({
                token: this.clientToken,
                eventCallback: (data: any) => {
                    console.log('Paddle Event:', data);
                }
            });
            this.initialized = true;
        } else {
            console.error("Paddle script not loaded");
        }
    }

    openCheckout(priceId: string, userId?: string, email?: string) {
        if (!this.initialized) this.initialize();

        const checkoutSettings: any = {
            items: [{ priceId, quantity: 1 }]
        };

        if (email) {
            checkoutSettings.customData = { email };
            checkoutSettings.customer = { email };
        }

        if (window.Paddle) {
            window.Paddle.Checkout.open(checkoutSettings);
        }
    }
}

export const paddleService = new PaddleService();
