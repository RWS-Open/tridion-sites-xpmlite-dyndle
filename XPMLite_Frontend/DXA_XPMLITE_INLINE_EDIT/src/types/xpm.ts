export interface SchemaLink {
  $type: string;
  IdRef: string;
  Title: string;
}

export interface BlueprintInfo {
  IsShared?: boolean;
  OwningRepository?: SchemaLink;
  PrimaryBluePrintParentItem?: SchemaLink;
}

export interface LocationInfo {
  OrganizationalItem?: SchemaLink;
}

export interface BinaryContent {
  IsExternal?: boolean;
  ExternalBinaryUri?: string;
  UploadFromFile?: string;
  Url?: string;
  MultimediaType?: SchemaLink;
  MimeType?: string;
  Filename?: string;
  Size?: number;
}

export interface FieldDefinition {
  $type: string;
  Name?: string;
  Description?: string;
  MinOccurs?: number;
  MaxOccurs?: number;
  Height?: number;
  List?: {
    Type?: string;
  };
  Keyword?: {
    Title?: string;
    Id: string
  };
  EmbeddedFields?: Record<string, FieldDefinition>;
  AllowedTargetSchemas?: SchemaLink[];
  [key: string]: unknown;
}

export interface LockInfo {
  $type?: string;
  LockDate?: string;
  LockType?: string[];
  LockUser?: {
    $type?: string;
    IdRef?: string;
    Title?: string;
    Description?: string;
  };
  [key: string]: unknown;
}

export interface XpmItem {
  Id: string;
  Title: string;
  Name?: string;
  BluePrintInfo?: BlueprintInfo;
  BusinessProcessType:SchemaLink;
  LocationInfo?: LocationInfo;
  LockInfo?: LockInfo;
  Content?: Record<string, unknown>;
  Fields?: Record<string, FieldDefinition>;
  MetadataFields?: Record<string, FieldDefinition>;
  MetadataContent?: Record<string, unknown>;
  Metadata?: Record<string, unknown>;
  Schema?: SchemaLink;
  ComponentType?: string;
  VersionInfo?: { RevisionDate: string };
  LinkedSchema?: { Title: string };
  IsPublishedInContext?: boolean;
  BinaryContent?: BinaryContent;
  PublishTransactionIds:string[];
  State:string;
  [key: string]: unknown;
}

export interface XpmTreeNode {
  Id?: string;
  title?: string;
  Title?: string;
  Name?: string;
  items?: XpmTreeNode[];
  contentItems?: XpmTreeNode[];
  loaded?: boolean;
  $type?: string;
  VersionInfo?: { RevisionDate: string };
  BinaryContent?: BinaryContent;
  LinkedSchema?: { Title: string };
  Schema?: { Title: string };
  BluePrintInfo?: BlueprintInfo;
  IsPublishedInContext?: boolean;
  ComponentType?: string;
}


export interface FieldsValueDictionary {
  $type: "FieldsValueDictionary";
  [key: string]: unknown;
}

export interface TaxonomyNode {
  Id: string;
  Title: string;
  ChildNodes?: TaxonomyNode[];
  [key: string]: unknown;
}

export interface TaxonomyResponse {
  ChildNodes?: TaxonomyNode[];
  [key: string]: unknown;
}

