import Link from "next/link";
import { Column, Row, Text, Heading, Media } from "@once-ui-system/core";
import { journal, JournalRow, projects, ProjectPreview } from "@/components/personal";
import { homeContent, photographs, assetPath } from "@/components/personal/data";
import styles from "@/components/personal/Personal.module.scss";

export default function Home() {
  return (
    <Column className={styles.shell}>
      <Column as="section" className={styles.hero} horizontal="center" align="center">
        <Text className={styles.heroBadge}>
          <span className={styles.statusDot} /> {homeContent.badge}
        </Text>
        <Heading as="h1" className={styles.heroTitle}>
          {homeContent.headline}
          <br />
          <em>{homeContent.subheadline}</em>
        </Heading>
        <Text className={styles.heroDescription} style={{ whiteSpace: "pre-line" }}>
          {homeContent.intro}
        </Text>
        <Row gap="24" vertical="center" className={styles.heroActions}>
          <Link className={styles.solidLink} href="/blog">
            读我的博客 <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/about" className={styles.softLink}>
            关于我 <span aria-hidden="true">→</span>
          </Link>
        </Row>
      </Column>
      <Link
        href="/gallery"
        className={styles.heroPhoto}
        aria-label={`浏览摄影集：${homeContent.coverTitle} ${homeContent.coverSubtitle}`}
      >
        <Media
          src={assetPath(homeContent.cover)}
          alt={homeContent.coverAlt}
          aspectRatio="2.5/1"
          priority
          sizes="(max-width: 1060px) 100vw, 1024px"
        />
        <Column className={styles.heroPhotoText} vertical="between">
          <Row horizontal="between">
            <Text className={styles.photoEyebrow}>THROUGH THE LENS</Text>
            <Text className={styles.photoEyebrow}>
              SELECTED FRAMES / {String(photographs.length).padStart(2, "0")}
            </Text>
          </Row>
          <Heading as="h2" className={styles.photoHeadline}>
            {homeContent.coverTitle}
            <br />
            <em>{homeContent.coverSubtitle}</em>
          </Heading>
          <Row horizontal="between" vertical="center">
            <Text className={styles.photoBottom}>{homeContent.coverDescription}</Text>
            <Text className={styles.circleArrow} aria-hidden="true">
              ↗
            </Text>
          </Row>
        </Column>
      </Link>
      <Column as="section" className={styles.section}>
        <Row className={styles.sectionTop} horizontal="between" vertical="center">
          <Heading as="h2" className={styles.sectionHeading}>
            最近在写 <span>Words & thoughts</span>
          </Heading>
          <Link href="/blog" className={styles.softLink}>
            全部文章 ↗
          </Link>
        </Row>
        {journal.slice(0, 3).map((entry) => (
          <JournalRow entry={entry} key={entry.slug} />
        ))}
      </Column>
      <Column as="section" className={styles.section}>
        <Row className={styles.sectionTop} horizontal="between" vertical="center">
          <Heading as="h2" className={styles.sectionHeading}>
            折腾的东西 <span>Selected projects</span>
          </Heading>
          <Link href="/work" className={styles.softLink}>
            全部项目 ↗
          </Link>
        </Row>
        <Column className={styles.projectGrid}>
          {projects
            .filter((p) => p.featured)
            .map((project) => (
              <ProjectPreview key={project.slug} project={project} />
            ))}
        </Column>
      </Column>
      <Row horizontal="between" vertical="center" className={styles.section}>
        <Text className={styles.eyebrow}>ALWAYS A WORK IN PROGRESS.</Text>
        <Text className={styles.eyebrow}>↖ MOVE AROUND. STAY CURIOUS.</Text>
      </Row>
    </Column>
  );
}
