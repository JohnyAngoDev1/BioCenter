import navbarData from '~/template/navbar.json';
import landingData from '~/template/landing.json';
import servicesData from '~/template/services.json';
import testimonialsData from '~/template/testimonials.json';
import contactData from '~/template/contact.json';
import footerData from '~/template/footer.json';
import buttonData from '~/template/button.json';

const templateData = {
    ...navbarData,
    ...landingData,
    ...servicesData,
    ...testimonialsData,
    ...contactData,
    ...footerData,
    ...buttonData   
};
export const useTemplate = () => {
    const t = (key: string): any => {
        const keys = key.split('.');
        let result: any = templateData;

        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                return key;
            }
        }
        return result;
    };
    return {
        t
    };
};
