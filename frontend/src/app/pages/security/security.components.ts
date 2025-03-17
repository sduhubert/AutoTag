import { Component } from '@angular/core';

interface SecurityFeature {
  title: string;
  description: string;
}

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent {
  securityFeatures: SecurityFeature[] = [
    {
      title: 'Data Encryption',
      description: 'All data is encrypted both in transit and at rest using industry-standard AES-256 encryption.'
    },
    {
      title: 'Access Controls',
      description: 'Granular role-based access controls ensure users can only access the data they need.'
    },
    {
      title: 'Audit Logging',
      description: 'Comprehensive audit trails track all user activities and system changes.'
    },
    {
      title: 'Regular Security Testing',
      description: 'Our systems undergo regular penetration testing and security audits by third-party experts.'
    },
    {
      title: 'Compliance',
      description: 'Auto Tag is compliant with GDPR, CCPA, SOC 2, and other major regulatory frameworks.'
    },
    {
      title: 'Disaster Recovery',
      description: 'Robust backup and disaster recovery procedures ensure business continuity.'
    }
  ];
}