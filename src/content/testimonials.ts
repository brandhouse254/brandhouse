/**
 * TESTIMONIALS
 * Add only genuine quotes that the client has approved for publication.
 * While this list is empty the testimonials section is hidden in production
 * and shows a clearly marked placeholder in local development only.
 */
export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

export const testimonials: Testimonial[] = [
  // {
  //   quote: "…",
  //   name: "Full name",
  //   role: "Job title",
  //   company: "Company",
  // },
];
