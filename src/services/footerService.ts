/**
 * Footer Service - MCP (Model Context Protocol) for Footer Content
 * 
 * This service manages all dynamic footer content using MCP pattern:
 * - Navigation links
 * - Company information
 * - Contact data
 * - Legal links
 * - Social media icons (if applicable)
 * 
 * Content can be fetched from external sources, updated dynamically,
 * or managed through configuration.
 */

export interface NavigationLink {
  label: string;
  path: string;
  requiresAuth?: boolean;
}

export interface CompanyInfo {
  name: string;
  legalName: string;
  year: number;
}

export interface ContactInfo {
  email: string;
  emailLabel?: string;
}

export interface LegalLink {
  label: string;
  path: string;
}

export interface SocialIcon {
  name: string;
  url: string;
  icon?: string;
}

export interface FooterContent {
  navigation: NavigationLink[];
  company: CompanyInfo;
  contact: ContactInfo;
  legal: LegalLink[];
  social?: SocialIcon[];
  logo?: {
    src: string;
    alt: string;
  };
}

/**
 * MCP Footer Service
 * Handles fetching and managing footer content dynamically
 */
class FooterService {
  private content: FooterContent | null = null;
  private subscribers: ((content: FooterContent) => void)[] = [];

  /**
   * Initialize footer content from MCP source
   * This can be extended to fetch from an API, CMS, or configuration service
   */
  async initialize(): Promise<FooterContent> {
    // For now, using static content based on Figma design
    // In production, this would fetch from an MCP server
    this.content = {
      navigation: [
        {
          label: 'Home',
          path: '/',
          requiresAuth: false,
        },
        {
          label: 'Open library',
          path: '/open-library',
          requiresAuth: false,
        },
        {
          label: 'Lesson builder',
          path: '/lesson-order',
          requiresAuth: false,
        },
        {
          label: 'Profile',
          path: '/profile',
          requiresAuth: true,
        },
        {
          label: 'Contacts',
          path: '/contacts',
          requiresAuth: false,
        },
      ],
      company: {
        name: 'Chiils',
        legalName: 'Koala Station DOO Beograd',
        year: new Date().getFullYear(),
      },
      contact: {
        email: 'team@chiils.com',
        emailLabel: 'team@chiils.com',
      },
      legal: [
        {
          label: 'Privacy policy',
          path: '/privacy',
        },
        {
          label: 'Terms & Conditions',
          path: '/termsofservice',
        },
      ],
      logo: {
        src: '/assets/chiils-footer-logo.svg',
        alt: 'Chiils',
      },
    };

    this.notifySubscribers();
    return this.content;
  }

  /**
   * Get current footer content
   */
  getContent(): FooterContent | null {
    return this.content;
  }

  /**
   * Update footer content (for dynamic updates)
   */
  updateContent(content: Partial<FooterContent>): void {
    if (!this.content) {
      this.content = {
        navigation: [],
        company: { name: '', legalName: '', year: new Date().getFullYear() },
        contact: { email: '' },
        legal: [],
      };
    }

    this.content = {
      ...this.content,
      ...content,
      company: {
        ...this.content.company,
        ...(content.company || {}),
      },
      contact: {
        ...this.content.contact,
        ...(content.contact || {}),
      },
    };

    this.notifySubscribers();
  }

  /**
   * Fetch content from MCP server (future implementation)
   * This is where you would integrate with an actual MCP server
   */
  async fetchFromMCP(): Promise<FooterContent> {
    // Placeholder for MCP server integration
    // Example: const response = await mcpClient.get('/footer/content');
    // return response.data;
    
    return this.initialize();
  }

  /**
   * Subscribe to content updates
   */
  subscribe(callback: (content: FooterContent) => void): () => void {
    this.subscribers.push(callback);
    
    // Immediately call with current content if available
    if (this.content) {
      callback(this.content);
    }

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers of content changes
   */
  private notifySubscribers(): void {
    if (this.content) {
      this.subscribers.forEach(callback => callback(this.content!));
    }
  }
}

// Export singleton instance
export const footerService = new FooterService();

// Initialize on module load
footerService.initialize();
