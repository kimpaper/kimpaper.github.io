---
layout: post
title: "SaaS 서비스를 위한 Harness AWS 권한 최소화 계정 구성"
date: '2026-07-20T00:00:00.000Z'
author: 페이퍼
tags: [aws, iam, harness, saas, devops, security]
categories: aws
url: /2026/07/20/harness-aws-limited-account/
---

SaaS 서비스를 AWS 위에 올리고 Harness로 CI/CD를 붙이려면 제일 먼저 고민해야 하는 부분이 **AWS 계정을 어떻게 연결할 것인가**이다.  
가장 쉬운 방법은 Access Key를 하나 만들고 `AdministratorAccess`를 붙이는 것이지만, 운영 서비스에서는 나중에 사고가 났을 때 영향 범위가 너무 커진다.

이번 글에서는 Harness가 AWS 리소스를 배포할 수 있도록 하되, 권한은 필요한 만큼만 주는 구성을 정리해 본다.

> 기준: Harness Delegate 또는 Harness Platform에서 AWS Connector를 만들고, SaaS 서비스 배포 대상 계정에 제한된 IAM Role을 제공하는 상황

## 결론부터

가능하면 다음 순서로 구성한다.

1. **IAM User Access Key를 기본값으로 두지 않는다.**
2. Harness가 AWS에 접근할 때는 **IAM Role + STS AssumeRole** 구조를 우선 사용한다.
3. 외부 SaaS인 Harness가 역할을 위임받는 구조라면 **External ID**를 trust policy에 넣는다.
4. 배포 대상별로 Role을 나눈다.
   - `harness-dev-deploy-role`
   - `harness-stg-deploy-role`
   - `harness-prod-deploy-role`
5. 처음부터 완벽한 least privilege를 만들려고 하기보다, 최소 권한으로 시작하고 Access Analyzer/CloudTrail을 보면서 줄인다.

AWS도 IAM 사용자 장기 Access Key보다 임시 자격 증명과 Role 사용을 권장하고, IAM 정책은 필요한 작업만 허용하는 최소 권한 원칙으로 작성하는 것이 기본이다.

## 추천 아키텍처

```text
Harness
  └─ AWS Connector
      ├─ Harness Delegate 또는 Harness Platform credential
      └─ STS AssumeRole
          └─ AWS target account
              └─ harness-*-deploy-role
                  ├─ ECR push/pull
                  ├─ ECS 또는 EKS 배포
                  ├─ S3 artifact 접근
                  ├─ CloudWatch Logs 조회
                  └─ 필요한 IAM PassRole만 허용
```

### 왜 Role인가?

Access Key는 한 번 유출되면 회수 전까지 계속 사용할 수 있는 장기 자격 증명이다. 반면 Role 기반 STS 인증은 세션 시간이 제한된 임시 자격 증명을 발급받는다. 또한 target account 입장에서는 trust policy와 permission policy를 분리해서 “누가 assume할 수 있는지”와 “assume한 뒤 무엇을 할 수 있는지”를 따로 통제할 수 있다.

Harness AWS Connector도 cross-account role ARN과 External ID를 입력하는 구성을 지원한다. Connector의 기본 credential이 target account의 role을 assume하고, assume된 role에 실제 배포에 필요한 S3/ECS/EC2/EKS 등의 권한을 붙이는 방식이다.

## 계정/역할 설계

개인적으로는 SaaS 운영 환경을 최소한 아래처럼 분리하는 것을 선호한다.

| 구분 | 용도 | Harness 권한 |
|---|---|---|
| `shared` | ECR, 공통 artifact, CI infra | 이미지 push/pull, artifact read/write |
| `dev` | 개발 배포 | 넓게 허용 가능하지만 admin은 지양 |
| `stg` | 운영 전 검증 | 운영과 유사하게 제한 |
| `prod` | 실제 고객 트래픽 | 가장 좁은 권한, 승인 단계 필수 |

처음에는 AWS Organizations까지 쓰지 않더라도, dev/stg/prod Role은 이름과 정책을 분리해 두는 편이 좋다. 나중에 계정을 나누거나 Control Tower를 도입할 때 이전 비용이 줄어든다.

## Trust policy 예시

외부에서 Harness가 assume할 Role의 trust policy는 아래처럼 시작할 수 있다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<HARNESS_OR_DELEGATE_ACCOUNT_ID>:role/<HARNESS_BASE_ROLE>"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "harness:<HARNESS_ACCOUNT_ID>:<SERVICE_NAME>:prod"
        }
      }
    }
  ]
}
```

여기서 중요한 것은 두 가지다.

- `Principal`은 가능한 구체적인 AWS account/role로 제한한다.
- `sts:ExternalId`를 넣어 confused deputy 문제를 줄인다.

External ID는 비밀번호처럼 숨겨지는 값은 아니지만, 제3자가 여러 고객 계정에 접근하는 상황에서 “이 assume 요청이 우리 계정을 위한 요청인지”를 구분하는 방어선으로 쓸 수 있다.

## Permission policy 예시: ECS 배포

서비스가 ECS/Fargate 기반이라고 가정하면 Harness 배포 Role은 대략 아래 권한에서 시작할 수 있다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EcrReadWriteForServiceRepositories",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:CompleteLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:BatchGetImage",
        "ecr:DescribeRepositories"
      ],
      "Resource": "*"
    },
    {
      "Sid": "EcsDeploy",
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeClusters",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService",
        "ecs:ListTasks",
        "ecs:DescribeTasks"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PassOnlyTaskRoles",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": [
        "arn:aws:iam::<ACCOUNT_ID>:role/<SERVICE_TASK_ROLE>",
        "arn:aws:iam::<ACCOUNT_ID>:role/<SERVICE_TASK_EXECUTION_ROLE>"
      ],
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": "ecs-tasks.amazonaws.com"
        }
      }
    },
    {
      "Sid": "CloudWatchLogsRead",
      "Effect": "Allow",
      "Action": [
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:GetLogEvents",
        "logs:FilterLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

실제 운영에서는 `Resource: "*"`를 최대한 줄이는 것이 좋다. 다만 ECR의 `GetAuthorizationToken`처럼 리소스 제한이 어려운 action도 있기 때문에, 처음에는 동작을 확인하고 점진적으로 repository ARN, cluster ARN, service ARN으로 좁혀 간다.

## Permission policy 예시: Terraform/IaC

Harness에서 Terraform으로 VPC, ECS, RDS까지 만들 계획이라면 권한 범위가 훨씬 커진다. 이 경우는 하나의 Role에 모든 권한을 몰아주기보다 다음처럼 나눈다.

| Role | 책임 |
|---|---|
| `harness-iac-plan-role` | `terraform plan`, read 중심 |
| `harness-iac-apply-role` | `terraform apply`, 승인 후 사용 |
| `harness-app-deploy-role` | 애플리케이션 이미지/서비스 배포 |

특히 `iam:*`, `organizations:*`, `account:*`, `kms:*` 같은 권한은 처음부터 열지 않는다. 필요한 경우에도 특정 path, prefix, tag condition을 붙여서 제한한다.

## Harness Connector 설정 순서

1. AWS IAM에서 target account에 `harness-prod-deploy-role`을 만든다.
2. Trust policy에 Harness 쪽 principal과 External ID를 넣는다.
3. Permission policy는 배포 방식(ECS/EKS/Lambda/Terraform)에 맞춰 최소 권한으로 붙인다.
4. Harness에서 AWS Connector를 만든다.
5. 인증 방식으로 cross-account role ARN 또는 delegate 기반 AssumeRole 구성을 선택한다.
6. External ID를 입력한다.
7. Test connection을 실행한다.
8. 실패한 action만 CloudTrail이나 Harness 로그에서 확인해서 정책에 추가한다.

Harness 문서 기준으로 AWS Connector의 connection test에는 기본적으로 `ec2:DescribeRegions`가 필요할 수 있다. 테스트가 실패했는데 실제 배포 권한 문제처럼 보이지 않는다면 이 action 누락도 같이 확인한다.

## 운영 체크리스트

- [ ] root 계정 MFA 활성화
- [ ] Harness용 장기 Access Key를 만들었다면 만료/회전 주기 지정
- [ ] prod Role에는 배포에 필요한 action만 허용
- [ ] `iam:PassRole`은 특정 task role/execution role만 허용
- [ ] External ID 사용
- [ ] CloudTrail 활성화
- [ ] IAM Access Analyzer로 외부 접근과 미사용 권한 점검
- [ ] prod 배포 파이프라인에는 Harness approval 또는 Change Management 단계 추가
- [ ] dev/stg/prod Connector 분리
- [ ] break-glass 관리자 계정은 별도 관리하고 평소에는 사용하지 않기

## 내가 잡은 원칙

SaaS 서비스의 CI/CD 권한은 “배포 자동화가 편해야 한다”와 “사고가 나도 blast radius가 작아야 한다” 사이의 균형이다. 그래서 나는 다음 원칙으로 시작하려고 한다.

- Harness에는 admin 권한을 주지 않는다.
- 사람이 쓰는 계정과 자동화가 쓰는 Role을 분리한다.
- 배포 Role은 환경별로 나눈다.
- `PassRole`과 `KMS` 권한은 특히 보수적으로 관리한다.
- 처음에는 배포 성공을 목표로 하되, 성공 후 바로 Access Analyzer/CloudTrail 기반으로 권한을 줄인다.

## 참고 문서

- [AWS IAM 보안 모범 사례](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS IAM 최소 권한 정책](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)
- [AWS confused deputy 문제와 External ID](https://docs.aws.amazon.com/IAM/latest/UserGuide/confused-deputy.html)
- [Harness AWS Connector 설정](https://developer.harness.io/docs/platform/connectors/cloud-providers/add-aws-connector/)
- [Harness AWS Connector settings reference](https://developer.harness.io/docs/platform/connectors/cloud-providers/ref-cloud-providers/aws-connector-settings-reference)
