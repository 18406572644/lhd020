import type { Person, ReferralRequest, PrivacySettings, CareerPath, NetworkStats, GraphData } from '@/types/network'
import { generateId } from './mockData'

const companies = ['字节跳动', '阿里巴巴', '腾讯', '美团', '百度', '京东', '拼多多', '快手', '小米', '华为', '网易', '蚂蚁集团', '滴滴出行', 'B站', '小红书', '得物', 'Shopee', 'Lazada', '微软', '谷歌', '亚马逊', 'Meta']
const positions = ['高级前端工程师', '前端架构师', '技术经理', '技术总监', '产品经理', '高级产品经理', '产品总监', '后端工程师', '高级后端工程师', '后端架构师', '算法工程师', '高级算法工程师', '数据分析师', 'UI设计师', '运营经理', '市场总监', 'HRBP']
const schools = ['清华大学', '北京大学', '北京邮电大学', '北京航空航天大学', '复旦大学', '上海交通大学', '浙江大学', '南京大学', '中国科学技术大学', '武汉大学', '华中科技大学', '西安交通大学', '哈尔滨工业大学', '同济大学', '北京理工大学', '中山大学', '华南理工大学', '四川大学', '电子科技大学', '大连理工大学']
const majors = ['计算机科学与技术', '软件工程', '电子信息工程', '通信工程', '自动化', '数学与应用数学', '信息管理与信息系统', '数据科学与大数据技术', '人工智能', '网络空间安全']
const degrees = ['本科', '硕士', '博士']
const industries = ['互联网', '金融科技', '电商', '游戏', '云计算', '人工智能', '大数据', '新能源', '智能制造', '生物医药']
const firstNames = ['李', '王', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗', '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹', '彭', '曾', '萧', '田', '董', '袁', '潘', '于', '蒋', '蔡']
const lastNames = ['伟', '芳', '娜', '秀英', '敏', '静', '强', '磊', '军', '洋', '艳', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '鑫', '波', '斌', '宇', '浩', '凯', '健', '俊', '帆', '鹏', '博', '婷', '雪', '倩', '琳', '欣', '颖']
const skills = ['Vue.js', 'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'Go', 'Rust', 'MySQL', 'MongoDB', 'Redis', 'Kafka', 'Kubernetes', 'Docker', '微服务', '分布式系统', '机器学习', '深度学习', '数据挖掘', '数据分析', '产品设计', '用户研究', '项目管理']
const projectNames = ['电商平台重构', '智能推荐系统', '即时通讯系统', '数据中台建设', '支付系统升级', '物流调度系统', '用户增长体系', '内容审核平台', '直播系统', '广告投放系统', '风控系统', 'CRM系统', 'ERP系统', 'OA系统', '移动端App', '小程序开发', '大数据平台', 'AI助手项目']

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
  return new Date(randomTime).toISOString().split('T')[0].substring(0, 7)
}

function generatePerson(index: number, connectionType: Person['connectionType'], connectionDegree: 1 | 2 | 3): Person {
  const firstName = randomItem(firstNames)
  const lastName = randomItem(lastNames)
  const name = firstName + lastName
  
  const school = randomItem(schools)
  const major = randomItem(majors)
  const degree = randomItem(degrees)
  
  const currentCompany = randomItem(companies)
  const currentPosition = randomItem(positions)
  
  const workHistoryCount = randomInt(2, 5)
  const workHistory: Person['workHistory'] = []
  let lastEndDate = '2020-01'
  for (let i = 0; i < workHistoryCount; i++) {
    const company = randomItem(companies)
    const position = randomItem(positions.filter(p => !p.includes('总监') || i === workHistoryCount - 1))
    const startDate = lastEndDate
    lastEndDate = randomDate(startDate, '2025-01')
    workHistory.unshift({
      company,
      position,
      startDate,
      endDate: i === workHistoryCount - 1 ? '' : lastEndDate
    })
  }
  workHistory[workHistoryCount - 1].company = currentCompany
  workHistory[workHistoryCount - 1].position = currentPosition
  workHistory[workHistoryCount - 1].endDate = ''

  const projectsCount = randomInt(1, 4)
  const projects: Person['projects'] = []
  for (let i = 0; i < projectsCount; i++) {
    projects.push({
      name: randomItem(projectNames),
      role: randomItem(['技术负责人', '核心开发', '产品经理', '架构师', '项目经理']),
      company: randomItem(companies)
    })
  }

  const skillsCount = randomInt(5, 12)
  const personSkills: string[] = []
  for (let i = 0; i < skillsCount; i++) {
    const skill = randomItem(skills)
    if (!personSkills.includes(skill)) {
      personSkills.push(skill)
    }
  }

  const anonymous = Math.random() > 0.7

  let score = 0
  if (currentPosition.includes('总监') || currentPosition.includes('架构师')) score += 30
  else if (currentPosition.includes('高级')) score += 20
  else score += 10
  if (['字节跳动', '阿里巴巴', '腾讯', '谷歌', '微软', 'Meta', '亚马逊'].includes(currentCompany)) score += 25
  if (['清华大学', '北京大学', '复旦大学', '上海交通大学', '浙江大学'].includes(school)) score += 20
  score += randomInt(10, 35)

  return {
    id: generateId(),
    name,
    avatar: '',
    currentCompany,
    currentPosition,
    industry: randomItem(industries),
    schools: [{
      school,
      major,
      degree,
      startDate: randomDate('2010-01', '2015-01'),
      endDate: randomDate('2014-01', '2019-01')
    }],
    workHistory,
    projects,
    skills: personSkills,
    connectionDegree,
    connectionType,
    score: Math.min(score, 100),
    lastActive: randomDate('2025-01', '2025-06'),
    anonymous,
    anonymousTitle: `${currentCompany.includes('跳动') || currentCompany.includes('巴巴') || currentCompany.includes('腾讯') ? '某大厂' : currentCompany} ${currentPosition}`
  }
}

export const mockPersons: Person[] = []

const alumniSchools = ['清华大学', '北京邮电大学', '北京航空航天大学']
for (let i = 0; i < 12; i++) {
  const person = generatePerson(i, 'alumni', i < 4 ? 1 : 2)
  person.schools[0].school = randomItem(alumniSchools)
  person.schools[0].major = randomItem(['计算机科学与技术', '软件工程', '电子信息工程'])
  mockPersons.push(person)
}

const colleagueCompanies = ['字节跳动', '阿里巴巴']
for (let i = 0; i < 10; i++) {
  const person = generatePerson(i + 12, 'colleague', i < 3 ? 1 : 2)
  const company = randomItem(colleagueCompanies)
  person.workHistory[0].company = company
  if (i >= 3) {
    person.connectionDegree = 2
  }
  mockPersons.push(person)
}

for (let i = 0; i < 8; i++) {
  const person = generatePerson(i + 22, 'project', 2)
  person.projects[0].name = randomItem(['电商智能推荐系统', '企业级低代码平台'])
  mockPersons.push(person)
}

for (let i = 0; i < 15; i++) {
  const person = generatePerson(i + 30, randomItem(['alumni', 'colleague', 'project', 'friend']), 3)
  mockPersons.push(person)
}

export const mockCareerPaths: CareerPath[] = [
  {
    id: generateId(),
    personId: mockPersons[0].id,
    personName: mockPersons[0].anonymous ? mockPersons[0].anonymousTitle : mockPersons[0].name,
    personTitle: mockPersons[0].currentPosition,
    similarity: 92,
    nodes: [
      { id: 'n1', company: '阿里巴巴', position: '前端工程师', startDate: '2015-07', endDate: '2017-06', durationMonths: 23 },
      { id: 'n2', company: '阿里巴巴', position: '高级前端工程师', startDate: '2017-06', endDate: '2019-09', durationMonths: 27 },
      { id: 'n3', company: '字节跳动', position: '前端技术专家', startDate: '2019-09', endDate: '2021-03', durationMonths: 18 },
      { id: 'n4', company: '字节跳动', position: '技术经理', startDate: '2021-03', endDate: '', durationMonths: 51 }
    ],
    totalYears: 10,
    promotions: 3,
    companies: 2
  },
  {
    id: generateId(),
    personId: mockPersons[1].id,
    personName: mockPersons[1].anonymous ? mockPersons[1].anonymousTitle : mockPersons[1].name,
    personTitle: mockPersons[1].currentPosition,
    similarity: 85,
    nodes: [
      { id: 'n1', company: '腾讯', position: '前端工程师', startDate: '2014-09', endDate: '2016-08', durationMonths: 23 },
      { id: 'n2', company: '美团', position: '高级前端工程师', startDate: '2016-08', endDate: '2018-11', durationMonths: 27 },
      { id: 'n3', company: '字节跳动', position: '前端架构师', startDate: '2018-11', endDate: '2020-05', durationMonths: 18 },
      { id: 'n4', company: '字节跳动', position: '技术总监', startDate: '2020-05', endDate: '', durationMonths: 61 }
    ],
    totalYears: 11,
    promotions: 3,
    companies: 3
  },
  {
    id: generateId(),
    personId: mockPersons[2].id,
    personName: mockPersons[2].anonymous ? mockPersons[2].anonymousTitle : mockPersons[2].name,
    personTitle: mockPersons[2].currentPosition,
    similarity: 78,
    nodes: [
      { id: 'n1', company: '百度', position: '前端工程师', startDate: '2016-07', endDate: '2018-05', durationMonths: 22 },
      { id: 'n2', company: '阿里巴巴', position: '高级前端工程师', startDate: '2018-05', endDate: '2020-08', durationMonths: 27 },
      { id: 'n3', company: '蚂蚁集团', position: '技术专家', startDate: '2020-08', endDate: '2022-10', durationMonths: 26 },
      { id: 'n4', company: '字节跳动', position: '高级前端工程师', startDate: '2022-10', endDate: '', durationMonths: 32 }
    ],
    totalYears: 9,
    promotions: 2,
    companies: 4
  },
  {
    id: generateId(),
    personId: mockPersons[3].id,
    personName: mockPersons[3].anonymous ? mockPersons[3].anonymousTitle : mockPersons[3].name,
    personTitle: mockPersons[3].currentPosition,
    similarity: 71,
    nodes: [
      { id: 'n1', company: '京东', position: '前端开发工程师', startDate: '2017-07', endDate: '2019-03', durationMonths: 20 },
      { id: 'n2', company: '拼多多', position: '高级前端工程师', startDate: '2019-03', endDate: '2021-06', durationMonths: 27 },
      { id: 'n3', company: '字节跳动', position: '前端架构师', startDate: '2021-06', endDate: '', durationMonths: 48 }
    ],
    totalYears: 8,
    promotions: 2,
    companies: 3
  }
]

export const defaultPrivacySettings: PrivacySettings = {
  showRealName: true,
  showCurrentCompany: true,
  showCurrentPosition: true,
  showWorkHistory: true,
  showEducation: true,
  showSkills: true,
  showProjects: true,
  showContactInfo: false,
  allowSearchBySchool: true,
  allowSearchByCompany: true,
  allowSearchBySkill: true,
  receiveReferralRequests: true,
  anonymousMode: false
}

export const mockReferralRequests: ReferralRequest[] = [
  {
    id: generateId(),
    targetPersonId: mockPersons[0].id,
    targetCompany: '字节跳动',
    targetPosition: '高级前端工程师',
    resumeVersion: '标准简历',
    message: '学长您好，我看到您在字节跳动担任技术经理，我目前也在字节跳动工作，希望能内推一下高级前端工程师的岗位，附上我的简历请您过目。',
    status: 'pending',
    createdAt: '2025-05-10T08:00:00Z',
    updatedAt: '2025-05-10T08:00:00Z'
  }
]

export const mockNetworkStats: NetworkStats = {
  totalConnections: mockPersons.length,
  firstDegree: mockPersons.filter(p => p.connectionDegree === 1).length,
  secondDegree: mockPersons.filter(p => p.connectionDegree === 2).length,
  thirdDegree: mockPersons.filter(p => p.connectionDegree === 3).length,
  alumniCount: mockPersons.filter(p => p.connectionType === 'alumni').length,
  colleagueCount: mockPersons.filter(p => p.connectionType === 'colleague').length,
  averageScore: Math.round(mockPersons.reduce((sum, p) => sum + p.score, 0) / mockPersons.length),
  topIndustries: [
    { name: '互联网', count: 28 },
    { name: '电商', count: 8 },
    { name: '人工智能', count: 5 },
    { name: '金融科技', count: 4 },
    { name: '大数据', count: 3 }
  ],
  topCompanies: [
    { name: '字节跳动', count: 12 },
    { name: '阿里巴巴', count: 8 },
    { name: '腾讯', count: 6 },
    { name: '美团', count: 4 },
    { name: '百度', count: 3 }
  ]
}

export function generateGraphData(): GraphData {
  const nodes: GraphData['nodes'] = []
  const links: GraphData['links'] = []

  nodes.push({
    id: 'me',
    name: '我',
    x: 400,
    y: 300,
    size: 30,
    color: '#409EFF',
    type: 'me',
    degree: 1
  })

  const typeColors: Record<string, string> = {
    alumni: '#67C23A',
    colleague: '#E6A23C',
    project: '#F56C6C',
    friend: '#909399'
  }

  const positions: Record<string, Array<{ x: number; y: number }>> = {
    alumni: [
      { x: 200, y: 150 }, { x: 300, y: 100 }, { x: 400, y: 80 }, { x: 500, y: 100 }, { x: 600, y: 150 },
      { x: 150, y: 250 }, { x: 180, y: 350 }, { x: 200, y: 450 },
      { x: 100, y: 200 }, { x: 120, y: 400 }, { x: 180, y: 500 }, { x: 140, y: 300 }
    ],
    colleague: [
      { x: 550, y: 200 }, { x: 620, y: 280 }, { x: 650, y: 380 },
      { x: 580, y: 450 }, { x: 520, y: 500 }, { x: 450, y: 520 },
      { x: 700, y: 250 }, { x: 720, y: 350 }, { x: 680, y: 450 }, { x: 600, y: 520 }
    ],
    project: [
      { x: 300, y: 450 }, { x: 350, y: 500 }, { x: 420, y: 520 }, { x: 500, y: 500 },
      { x: 250, y: 480 }, { x: 550, y: 480 }, { x: 380, y: 540 }, { x: 480, y: 540 }
    ],
    friend: Array.from({ length: 15 }, (_, i) => ({
      x: 80 + (i % 5) * 30 + (i < 5 ? 0 : i < 10 ? 20 : 10),
      y: 20 + Math.floor(i / 5) * 180 + (i % 2) * 20
    }))
  }

  const typePositions: Record<string, number> = {
    alumni: 0,
    colleague: 0,
    project: 0,
    friend: 0
  }

  mockPersons.forEach(person => {
    const posIndex = typePositions[person.connectionType]
    const posList = positions[person.connectionType]
    if (posIndex < posList.length) {
      const pos = posList[posIndex]
      typePositions[person.connectionType]++

      const size = person.connectionDegree === 1 ? 18 : person.connectionDegree === 2 ? 14 : 10

      nodes.push({
        id: person.id,
        name: person.anonymous ? person.anonymousTitle : person.name,
        x: pos.x,
        y: pos.y,
        size,
        color: typeColors[person.connectionType],
        type: person.connectionType,
        degree: person.connectionDegree,
        person
      })

      if (person.connectionDegree === 1) {
        links.push({
          source: 'me',
          target: person.id,
          strength: 1,
          type: person.connectionType
        })
      } else if (person.connectionDegree === 2) {
        const firstDegreePerson = mockPersons.find(p => p.connectionDegree === 1 && p.connectionType === person.connectionType)
        if (firstDegreePerson) {
          links.push({
            source: firstDegreePerson.id,
            target: person.id,
            strength: 0.6,
            type: person.connectionType
          })
        } else {
          links.push({
            source: 'me',
            target: person.id,
            strength: 0.6,
            type: person.connectionType
          })
        }
      } else {
        const secondDegreePerson = mockPersons.find(p => p.connectionDegree === 2 && p.connectionType === person.connectionType)
        if (secondDegreePerson) {
          links.push({
            source: secondDegreePerson.id,
            target: person.id,
            strength: 0.3,
            type: person.connectionType
          })
        }
      }
    }
  })

  return { nodes, links }
}

export const targetCompanyOptions = companies.slice(0, 15).map(c => ({ label: c, value: c }))
