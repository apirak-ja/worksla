#!/usr/bin/env python3
"""
Fix WorkPackageDetailPro.tsx to use Table layout instead of Grid
"""

def main():
    filepath = '/opt/code/openproject/worksla/frontend/src/pages/workpackages/WorkPackageDetailPro.tsx'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the section to replace (from "Custom Fields" comment to end of Grid)
    start_marker = '                  {/* Custom Fields - Professional Layout */}'
    end_marker = '                      </Grid>\n                    </Box>\n                  </Fade>'
    
    start_idx = content.find(start_marker)
    if start_idx == -1:
        print("Start marker not found!")
        return
    
    # Find end marker after start
    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        print("End marker not found!")
        return
    
    end_idx += len(end_marker)
    
    # New Table-based content
    new_content = '''                  {/* Information Table */}
                  <Fade in timeout={800}>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                        <Avatar sx={{ bgcolor: '#8b5cf6', width: 48, height: 48 }}>
                          <Category />
                        </Avatar>
                        <Typography variant="h5" fontWeight={800} color="#5b21b6">
                          📋 ข้อมูลรายละเอียด
                        </Typography>
                      </Stack>

                      <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                          borderRadius: 3,
                          border: `2px solid ${alpha('#8b5cf6', 0.2)}`,
                          overflow: 'hidden',
                        }}
                      >
                        <Table>
                          <TableBody>
                            {/* Basic Information Section */}
                            <TableRow sx={{ bgcolor: alpha('#3b82f6', 0.1) }}>
                              <TableCell
                                colSpan={2}
                                sx={{
                                  borderBottom: `3px solid ${alpha('#3b82f6', 0.3)}`,
                                  py: 2,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ bgcolor: '#3b82f6', width: 36, height: 36 }}>
                                    <Category />
                                  </Avatar>
                                  <Typography variant="h6" fontWeight={800} color="#1e40af">
                                    ข้อมูลพื้นฐาน
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            {wp.type && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#3b82f6', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  📋 ประเภท
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1e40af' }}>
                                  {wp.type}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.priority && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#3b82f6', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  🎯 ระดับความสำคัญ
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={priorityConfig.icon}
                                    label={wp.priority}
                                    sx={{
                                      bgcolor: alpha(priorityConfig.color, 0.15),
                                      color: priorityConfig.color,
                                      fontWeight: 800,
                                      border: `2px solid ${alpha(priorityConfig.color, 0.3)}`,
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.category && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#3b82f6', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  🏷️ Category
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={wp.category}
                                    sx={{
                                      bgcolor: alpha('#8b5cf6', 0.1),
                                      color: '#5b21b6',
                                      fontWeight: 700,
                                      border: `1px solid ${alpha('#8b5cf6', 0.3)}`,
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            )}

                            {/* Contact Information Section */}
                            <TableRow sx={{ bgcolor: alpha('#ec4899', 0.1) }}>
                              <TableCell
                                colSpan={2}
                                sx={{
                                  borderBottom: `3px solid ${alpha('#ec4899', 0.3)}`,
                                  borderTop: `3px solid ${alpha('#3b82f6', 0.2)}`,
                                  py: 2,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ bgcolor: '#ec4899', width: 36, height: 36 }}>
                                    <ContactPhone />
                                  </Avatar>
                                  <Typography variant="h6" fontWeight={800} color="#9f1239">
                                    ข้อมูลการติดต่อ
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            {wp.customField12 && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#ec4899', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  📞 ผู้แจ้ง-ติดต่อกลับ
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#9f1239' }}>
                                  {wp.customField12}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.customField10 && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#ec4899', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  👨 แจ้งโดย
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#9f1239' }}>
                                  {wp.customField10}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.author_name && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#ec4899', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  ✍️ ผู้สร้างงาน
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#9f1239' }}>
                                  {wp.author_name}
                                </TableCell>
                              </TableRow>
                            )}

                            {/* Location Information Section */}
                            <TableRow sx={{ bgcolor: alpha('#10b981', 0.1) }}>
                              <TableCell
                                colSpan={2}
                                sx={{
                                  borderBottom: `3px solid ${alpha('#10b981', 0.3)}`,
                                  borderTop: `3px solid ${alpha('#ec4899', 0.2)}`,
                                  py: 2,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ bgcolor: '#10b981', width: 36, height: 36 }}>
                                    <LocationOn />
                                  </Avatar>
                                  <Typography variant="h6" fontWeight={800} color="#065f46">
                                    ข้อมูลสถานที่
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            {wp.customField1 && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#10b981', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  📍 สถานที่ตั้ง
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#065f46' }}>
                                  {wp.customField1}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.customField5 && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#10b981', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  🏢 หน่วยงานที่ตั้ง
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#065f46' }}>
                                  {wp.customField5}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.customField3 && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#10b981', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  💻 ประเภทงาน-คอมฮาร์ดแวร์
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#065f46' }}>
                                  {wp.customField3}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.project_name && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#10b981', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  📁 โครงการ
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#065f46' }}>
                                  {wp.project_name}
                                </TableCell>
                              </TableRow>
                            )}

                            {/* Schedule Section */}
                            <TableRow sx={{ bgcolor: alpha('#f59e0b', 0.1) }}>
                              <TableCell
                                colSpan={2}
                                sx={{
                                  borderBottom: `3px solid ${alpha('#f59e0b', 0.3)}`,
                                  borderTop: `3px solid ${alpha('#10b981', 0.2)}`,
                                  py: 2,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ bgcolor: '#f59e0b', width: 36, height: 36 }}>
                                    <Schedule />
                                  </Avatar>
                                  <Typography variant="h6" fontWeight={800} color="#92400e">
                                    กำหนดการ
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            {wp.customField11 && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#f59e0b', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  📅 วันที่ต้องการ
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#92400e' }}>
                                  {wp.customField11}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.customField9 && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#f59e0b', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  ⚡ ความเร่งด่วน
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={<Bolt />}
                                    label={wp.customField9}
                                    sx={{
                                      bgcolor: wp.customField9?.toLowerCase().includes('ด่วน') ? '#ef4444' : '#f59e0b',
                                      color: 'white',
                                      fontWeight: 800,
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.start_date && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#f59e0b', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  🚀 วันที่เริ่ม
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#92400e' }}>
                                  {format(new Date(wp.start_date), 'dd MMMM yyyy', { locale: th })}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.due_date && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#f59e0b', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  🏁 กำหนดเสร็จ (Finish date)
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#92400e' }}>
                                  {format(new Date(wp.due_date), 'dd MMMM yyyy', { locale: th })}
                                </TableCell>
                              </TableRow>
                            )}

                            {/* Assignment Section */}
                            <TableRow sx={{ bgcolor: alpha('#0ea5e9', 0.1) }}>
                              <TableCell
                                colSpan={2}
                                sx={{
                                  borderBottom: `3px solid ${alpha('#0ea5e9', 0.3)}`,
                                  borderTop: `3px solid ${alpha('#f59e0b', 0.2)}`,
                                  py: 2,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ bgcolor: '#0ea5e9', width: 36, height: 36 }}>
                                    <Groups />
                                  </Avatar>
                                  <Typography variant="h6" fontWeight={800} color="#075985">
                                    ผู้รับผิดชอบ
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            <TableRow sx={{ '&:hover': { bgcolor: alpha('#0ea5e9', 0.05) } }}>
                              <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                👤 ผู้รับผิดชอบหลัก
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar
                                    sx={{
                                      bgcolor: '#0ea5e9',
                                      width: 40,
                                      height: 40,
                                      fontSize: '1.2rem',
                                      fontWeight: 900,
                                    }}
                                  >
                                    {wp.assignee_name?.charAt(0) || '?'}
                                  </Avatar>
                                  <Typography variant="body1" fontWeight={700} color="#075985">
                                    {wp.assignee_name || 'ยังไม่ได้มอบหมาย'}
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>

                            {/* Dates Section */}
                            <TableRow sx={{ bgcolor: alpha('#8b5cf6', 0.1) }}>
                              <TableCell
                                colSpan={2}
                                sx={{
                                  borderBottom: `3px solid ${alpha('#8b5cf6', 0.3)}`,
                                  borderTop: `3px solid ${alpha('#0ea5e9', 0.2)}`,
                                  py: 2,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ bgcolor: '#8b5cf6', width: 36, height: 36 }}>
                                    <AccessTime />
                                  </Avatar>
                                  <Typography variant="h6" fontWeight={800} color="#5b21b6">
                                    ข้อมูลวันที่
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            {wp.created_at && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#8b5cf6', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  📝 วันที่สร้าง
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#5b21b6' }}>
                                  {format(new Date(wp.created_at), 'dd MMMM yyyy HH:mm', { locale: th })}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.updated_at && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#8b5cf6', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  🔄 วันที่อัปเดตล่าสุด
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#5b21b6' }}>
                                  {format(new Date(wp.updated_at), 'dd MMMM yyyy HH:mm', { locale: th })}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Fade>'''
    
    # Replace
    new_file_content = content[:start_idx] + new_content + content[end_idx:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_file_content)
    
    print("✅ Successfully replaced Grid layout with Table layout!")
    print(f"   Removed: {end_idx - start_idx} characters")
    print(f"   Added: {len(new_content)} characters")

if __name__ == '__main__':
    main()
