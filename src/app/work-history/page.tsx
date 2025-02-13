import CenterWrapper from '#/components/center-wrapper';
import { ListItem, UnorderedList } from '#/components/ui/list';
import { formatDate } from 'date-fns';
import { work_history, education, publications, patents } from '#velite';
import { Metadata } from 'next';
import createMetadata from '#/lib/create-metadata';
import type { WithContext, Person } from 'schema-dts';
import siteConfig from '../../../site.config';
import { Link } from '#/components/ui/link';
import {
  SectionTitle,
  SectionHead,
  SectionSubHead,
  SectionWrapper,
  SectionContent,
  SectionInfo
} from './.components/section-items';
import { Link2 } from 'lucide-react';

const SORTED_JOBS_DESC = work_history.toSorted(
  (a, b) =>
    new Date(b.time_range[0]).getTime() - new Date(a.time_range[0]).getTime()
);

const jsonLd: WithContext<Person> = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: `${siteConfig.profile.firstName} ${siteConfig.profile.lastName}`,
  email: siteConfig.profile.emailAddress,
  url: siteConfig.profile.linkedInURL,
  address: {
    '@type': 'PostalAddress',
    addressLocality: work_history[work_history.length - 1].city,
    addressRegion: work_history[work_history.length - 1].state
  },
  alumniOf: education.map((e) => ({
    '@type': 'EducationalOrganization',
    name: e.uni
  })),
  hasCredential: education.map((e) => ({
    '@type': 'EducationalOccupationalCredential',
    name: e.degree
  })),
  workLocation: {
    '@type': 'Place',
    name: `${work_history[work_history.length - 1].city}, ${work_history[work_history.length - 1].state}`
  },
  memberOf: work_history.map((job) => ({
    '@type': 'OrganizationRole',
    roleName: job.title,
    startDate: job.time_range[0],
    ...(job.time_range[1] === null ? {} : { endDate: job.time_range[1] }),
    memberOf: {
      '@type': 'Organization',
      name: job.company
    }
  }))
};

export const metadata: Metadata = createMetadata({
  title: 'Resume',
  description: 'Description of my work history',
  openGraph: {
    title: 'Resume',
    description: 'Description of my work history',
    url: '/work-history'
  },
  twitter: {
    title: 'Resume',
    description: 'Description of my work history'
  }
});

export default async function WorkHistoryPage() {
  return (
    <CenterWrapper asChild>
      <main className='flex flex-col space-y-10'>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SectionTitle>Education</SectionTitle>
        {education.map((education, idx) => {
          const { uni, degree, time_range, city, state } = education;
          const [startDate, endDate] = time_range;

          return (
            <SectionWrapper key={idx}>
              <SectionHead>{uni}</SectionHead>
              <SectionSubHead>{degree}</SectionSubHead>
              <SectionInfo>
                {formatDate(startDate, 'MMM yyyy')} -{' '}
                {endDate ? formatDate(endDate, 'MMM yyyy') : 'Current'}
                <br />
                {city},{state}
              </SectionInfo>
            </SectionWrapper>
          );
        })}
        <SectionTitle>Work History</SectionTitle>
        {SORTED_JOBS_DESC.map(async (job, idx) => {
          const { title, company, time_range, city, state, desc, urls } = job;
          const [startDate, endDate] = time_range;

          return (
            <SectionWrapper key={idx}>
              <SectionHead>{title}</SectionHead>
              <SectionSubHead>{company}</SectionSubHead>

              <SectionInfo>
                {formatDate(startDate, 'MMM yyyy')} -{' '}
                {endDate ? formatDate(endDate, 'MMM yyyy') : 'Current'}
                <br />
                {city},{state}
              </SectionInfo>
              <SectionContent asChild>
                <UnorderedList>
                  {desc.map((item, jdx) => (
                    <ListItem key={jdx}>{item}</ListItem>
                  ))}
                </UnorderedList>
              </SectionContent>
              {urls && (
                <div className='mt-2 flex flex-col md:flex-row md:gap-3'>
                  {urls.map(({ name, url }, idx) => (
                    <Link
                      key={idx}
                      href={url}
                      className='flex w-fit items-center gap-1'>
                      {name}
                      <Link2 className='size-4' />
                    </Link>
                  ))}
                </div>
              )}
            </SectionWrapper>
          );
        })}
        <SectionTitle>Publications</SectionTitle>
        {publications.map((pub, idx) => {
          const { title, date_published, desc, publisher, journal, url } = pub;

          return (
            <SectionWrapper key={idx}>
              <SectionHead>{title}</SectionHead>
              <SectionSubHead>{journal ?? publisher}</SectionSubHead>
              <SectionInfo>
                {formatDate(date_published, 'MMM dd yyyy')}
              </SectionInfo>
              <SectionContent>{desc}</SectionContent>
              <Link
                href={url}
                target='_blank'
                rel='noreferrer'
                className='mt-1 w-fit'>
                Link
              </Link>
            </SectionWrapper>
          );
        })}
        <SectionTitle>Patents</SectionTitle>
        {patents.map((patent, idx) => {
          const { title, desc, patent_number, date_issued, url } = patent;

          return (
            <SectionWrapper key={idx}>
              <SectionHead>{title}</SectionHead>
              <SectionSubHead>{patent_number}</SectionSubHead>
              <SectionInfo>
                {formatDate(date_issued, 'MMM dd yyyy')}
              </SectionInfo>
              {desc && <SectionContent>{desc}</SectionContent>}
              <Link
                href={url}
                target='_blank'
                rel='noreferrer'
                className='mt-1 w-fit'>
                Link
              </Link>
            </SectionWrapper>
          );
        })}
      </main>
    </CenterWrapper>
  );
}
