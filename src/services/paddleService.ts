import api from './api.ts';

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
            const initOptions: any = {
                token: this.clientToken,
                eventCallback: (data: any) => {
                    console.log('Paddle Event:', data);
                }
            };

            if (window.Paddle.Initialize) {
                window.Paddle.Initialize(initOptions);
            } else if (window.Paddle.Setup) {
                window.Paddle.Setup(initOptions);
            }

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

    async openCustomerPortal(customerId?: string) {
        try {
            const response = await api.get<string>('/paddle/portal-session');
            const portalUrl = response.data;

            if (portalUrl) {
                console.log('Redirecting to Paddle Customer Portal');
                window.location.href = portalUrl;
            } else {
                console.error('Failed to get portal session URL');
                alert('Could not open customer portal. Please try again later.');
            }
        } catch (error) {
            console.error('Error opening customer portal:', error);
            alert('Error opening customer portal. Please contact support.');
        }
    }
}

export const paddleService = new PaddleService();
