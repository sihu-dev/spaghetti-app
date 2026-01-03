/**
 * PDF Catalog Template
 * React-PDF를 사용한 제조업체 카탈로그 생성
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ProductInfo } from "../ai/vision";

// 폰트 등록 (선택사항)
// Font.register({
//   family: 'Pretendard',
//   src: '/fonts/Pretendard-Regular.ttf'
// });

const styles = StyleSheet.create({
  // Page
  page: {
    padding: 40,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },

  // Cover Page
  cover: {
    padding: 0,
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  coverContent: {
    textAlign: "center",
    width: "100%",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
    alignSelf: "center",
  },
  coverTitle: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1A1A1A",
  },
  coverSubtitle: {
    fontSize: 24,
    color: "#666666",
    marginBottom: 10,
  },
  coverCompany: {
    fontSize: 18,
    color: "#999999",
    marginTop: 60,
  },

  // Product Page
  productPage: {
    padding: 40,
  },
  productHeader: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: "2 solid #E5E5E5",
  },
  productTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 14,
    color: "#666666",
  },

  // Product Image
  productImageContainer: {
    width: "100%",
    height: 300,
    marginBottom: 30,
    backgroundColor: "#F5F5F5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  productImage: {
    maxWidth: "90%",
    maxHeight: "90%",
    objectFit: "contain",
  },

  // Specifications
  specsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
  },
  specsTable: {
    display: "flex",
    flexDirection: "column",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
  },
  specRow: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1 solid #E5E5E5",
  },
  specRowLast: {
    borderBottom: "none",
  },
  specLabel: {
    width: "35%",
    padding: 12,
    backgroundColor: "#F5F5F5",
    fontSize: 12,
    color: "#666666",
    fontWeight: "bold",
  },
  specValue: {
    width: "65%",
    padding: 12,
    fontSize: 12,
    color: "#1A1A1A",
  },

  // Features
  featuresSection: {
    marginTop: 20,
  },
  featuresList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  featureItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
    marginTop: 5,
  },
  featureText: {
    fontSize: 12,
    color: "#1A1A1A",
    flex: 1,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 15,
    borderTop: "1 solid #E5E5E5",
  },
  footerText: {
    fontSize: 10,
    color: "#999999",
  },
  pageNumber: {
    fontSize: 10,
    color: "#999999",
  },

  // Contact Page
  contactSection: {
    marginBottom: 30,
  },
  contactItem: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 15,
    gap: 10,
  },
  contactLabel: {
    fontSize: 14,
    color: "#666666",
    width: 100,
  },
  contactValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "bold",
  },
});

export interface CatalogData {
  title: string;
  companyName: string;
  logo?: string;
  products: ProductInfo[];
  brandColor?: string;
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

/**
 * 표지 페이지
 */
const CoverPage: React.FC<{ data: CatalogData }> = ({ data }) => (
  <Page size="A4" style={styles.cover}>
    <View style={styles.coverContent}>
      {data.logo && <Image src={data.logo} style={styles.logo} />}

      <Text style={styles.coverTitle}>{data.title}</Text>

      <Text style={styles.coverSubtitle}>Product Catalog</Text>

      <Text style={styles.coverCompany}>{data.companyName}</Text>
    </View>
  </Page>
);

/**
 * 제품 페이지
 */
const ProductPage: React.FC<{
  product: ProductInfo;
  companyName: string;
  pageNumber: number;
}> = ({ product, companyName, pageNumber }) => {
  const specs = product.specifications || {};
  const features = product.features || [];

  return (
    <Page size="A4" style={styles.productPage}>
      {/* Header */}
      <View style={styles.productHeader}>
        <Text style={styles.productTitle}>
          {product.modelName || "Product Name"}
        </Text>
        <Text style={styles.productCategory}>
          {product.category || "Category"}
        </Text>
      </View>

      {/* Image Placeholder */}
      <View style={styles.productImageContainer}>
        <Text style={{ color: "#999999", fontSize: 12 }}>Product Image</Text>
      </View>

      {/* Specifications */}
      {Object.keys(specs).length > 0 && (
        <View style={styles.specsSection}>
          <Text style={styles.sectionTitle}>Specifications</Text>

          <View style={styles.specsTable}>
            {Object.entries(specs).map(([key, value], index, arr) => (
              <View
                key={key}
                style={[
                  styles.specRow,
                  index === arr.length - 1 && styles.specRowLast,
                ]}
              >
                <Text style={styles.specLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <Text style={styles.specValue}>
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Features */}
      {features.length > 0 && (
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>

          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureBullet} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{companyName}</Text>
        <Text style={styles.pageNumber}>{pageNumber}</Text>
      </View>
    </Page>
  );
};

/**
 * 연락처 페이지
 */
const ContactPage: React.FC<{
  data: CatalogData;
  pageNumber: number;
}> = ({ data, pageNumber }) => (
  <Page size="A4" style={styles.productPage}>
    <View style={styles.productHeader}>
      <Text style={styles.productTitle}>Contact Us</Text>
    </View>

    <View style={styles.contactSection}>
      {data.contact?.address && (
        <View style={styles.contactItem}>
          <Text style={styles.contactLabel}>Address</Text>
          <Text style={styles.contactValue}>{data.contact.address}</Text>
        </View>
      )}

      {data.contact?.phone && (
        <View style={styles.contactItem}>
          <Text style={styles.contactLabel}>Phone</Text>
          <Text style={styles.contactValue}>{data.contact.phone}</Text>
        </View>
      )}

      {data.contact?.email && (
        <View style={styles.contactItem}>
          <Text style={styles.contactLabel}>Email</Text>
          <Text style={styles.contactValue}>{data.contact.email}</Text>
        </View>
      )}

      {data.contact?.website && (
        <View style={styles.contactItem}>
          <Text style={styles.contactLabel}>Website</Text>
          <Text style={styles.contactValue}>{data.contact.website}</Text>
        </View>
      )}
    </View>

    <View style={styles.footer}>
      <Text style={styles.footerText}>{data.companyName}</Text>
      <Text style={styles.pageNumber}>{pageNumber}</Text>
    </View>
  </Page>
);

/**
 * 전체 카탈로그 PDF 문서
 */
export const CatalogDocument: React.FC<{ data: CatalogData }> = ({ data }) => {
  return (
    <Document>
      {/* 표지 */}
      <CoverPage data={data} />

      {/* 제품 페이지들 */}
      {data.products.map((product, index) => (
        <ProductPage
          key={index}
          product={product}
          companyName={data.companyName}
          pageNumber={index + 2}
        />
      ))}

      {/* 연락처 */}
      {data.contact && (
        <ContactPage data={data} pageNumber={data.products.length + 2} />
      )}
    </Document>
  );
};
