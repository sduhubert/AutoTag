import { Component } from '@angular/core';

interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  faqItems: FaqItem[] = [
    {
      question: 'What is Auto Tag?',
      answer: 'Auto Tag is an intelligent automation platform that helps organizations streamline their data tagging, categorization, and management processes using AI and custom rule-based systems.',
      isOpen: false
    },
    {
      question: 'How does Auto Tag work?',
      answer: 'Auto Tag uses a combination of machine learning algorithms and customizable rule sets to automatically analyze, categorize, and tag your content. You can configure the system to match your specific needs and workflows.',
      isOpen: false
    },
    {
      question: 'Can Auto Tag integrate with my existing systems?',
      answer: 'Yes! Auto Tag is designed to work with a wide range of existing systems through our comprehensive API and pre-built integrations for popular platforms.',
      isOpen: false
    },
    {
      question: 'Is there a limit to the amount of data Auto Tag can process?',
      answer: 'Auto Tag is built on a scalable architecture that can handle enterprise-level data volumes. Our pricing tiers accommodate different data processing needs.',
      isOpen: false
    },
    {
      question: 'How accurate is the automatic tagging?',
      answer: 'Auto Tag accuracy depends on the complexity of your tagging needs and the quality of your training data. Most clients report 85-95% accuracy after initial setup, which improves over time as the system learns.',
      isOpen: false
    },
    {
      question: 'How long does it take to implement Auto Tag?',
      answer: 'Basic implementation can be completed in just a few days. More complex integrations with custom workflows may take 2-3 weeks. Our implementation team will work with you to create a specific timeline.',
      isOpen: false
    },
    {
      question: 'What kind of support does Auto Tag provide?',
      answer: 'We offer multiple support tiers, including standard email support, premium support with 24/7 coverage, and dedicated account management for enterprise clients.',
      isOpen: false
    },
    {
      question: 'Is Auto Tag secure?',
      answer: 'Absolutely. Security is a top priority at Auto Tag. We employ industry-standard encryption, regular security audits, and comprehensive access controls to protect your data.',
      isOpen: false
    }
  ];

  toggleFaq(item: FaqItem): void {
    item.isOpen = !item.isOpen;
  }
}